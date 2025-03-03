import { Gtk } from "astal/gtk3";
import { GLib, Gio, Variable, bind, execAsync } from "astal";
import { booruImageMetadata } from "./api";

async function preview(i: number) {
  console.log("Previewing image", i);
  // Set the relevant paths
  const previewPath = `/tmp/booru_${i}.jpg`;
  const samplePath = `/tmp/booru_sample_${i}.jpg`;
  const sample_link = booruImageMetadata.get()[previewPath].sample_url;
  console.log("Downloading sample image", sample_link);

  // Download the sample image to /tmp and open it
  await execAsync(`curl -s -o ${samplePath} ${sample_link}`);
  execAsync(`qimgv ${samplePath}`);
}

async function download(i: number) {
  console.log("Downloading image", i);

  // Set all the relevant paths
  const previewPath = `/tmp/booru_${i}.jpg`;
  const homeDir = Gio.File.new_for_path(GLib.get_home_dir());
  const GIOdownloadDir = homeDir.get_child("Pictures").get_child("booru");
  const downloadDir = GIOdownloadDir.get_path();
  const file_link = booruImageMetadata.get()[previewPath].file_url;

  // Get the file name from the URL
  const urlParts = file_link.split("/");
  const rawFileName = urlParts[urlParts.length - 1];
  const decodedFileName = decodeURIComponent(rawFileName);
  const fileName = decodedFileName.replace(/ /g, "_");
  console.log("Downloading image: ", file_link, " as ", fileName);

  // make sure download directory exists
  await execAsync(`mkdir -p ${downloadDir}`).catch((e) => {
    console.error("Failed to create download directory", e);
  });

  // Set the final download path
  const downloadPath = `${downloadDir}/${fileName}`;

  // Execute the download and open the image
  try {
    await execAsync(`curl -s -o ${downloadPath} ${file_link}`);
    console.log("Downloaded image to", downloadPath);
    await execAsync(`qimgv ${downloadPath}`);
  } catch (e) {
    console.error("Failed to download image", e);
  }
}

export default function BooruDisplay({
  response,
}: {
  response: Variable<string[]>;
}) {
  return (
    <box vertical spacing={5}>
      <scrollable
        className="BooruDisplayScrollable"
        vexpand={true}
        hexpand={true}
        hscroll={Gtk.PolicyType.NEVER}
        vscroll={Gtk.PolicyType.AUTOMATIC}
        halign={Gtk.Align.FILL}
      >
        <box vertical spacing={10} halign={Gtk.Align.CENTER}>
          {bind(response).as((filePaths) => {
            // Group images into pairs
            const pairs: string[][] = [];
            for (let i = 0; i < filePaths.length; i += 2) {
              pairs.push(filePaths.slice(i, i + 2));
            }

            return pairs.map((pair, pairIndex) => (
              <box spacing={10} halign={Gtk.Align.CENTER}>
                {pair.map((filePath, index) => {
                  const imageIndex = pairIndex * 2 + index;
                  return (
                    <box vertical halign={Gtk.Align.CENTER}>
                      <box
                        className="booru"
                        css={`
                          background-image: url("file://${filePath}");
                          background-size: contain;
                          background-position: center;
                          background-repeat: no-repeat;
                          min-height: 200px;
                          min-width: 250px;
                        `}
                        halign={Gtk.Align.CENTER}
                      ></box>
                      <box halign={Gtk.Align.CENTER}>
                        <button
                          onClicked={() => {
                            preview(imageIndex);
                          }}
                        >
                          Preview
                        </button>
                        <button
                          onClicked={() => {
                            download(imageIndex);
                          }}
                        >Download</button>
                      </box>
                    </box>
                  );
                })}
              </box>
            ));
          })}
        </box>
      </scrollable>
    </box>
  );
}
