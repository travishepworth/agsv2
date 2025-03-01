import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { GLib, Gio, Variable, bind, exec, execAsync } from "astal";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";

const MAX_ITEMS = 12;
const CACHE_DIR = `${GLib.get_user_cache_dir()}/ags/thumbnails`;

function hide() {
  App.get_window("wallpaper")!.hide();
}

function set_wallpaper(wallpaper: string) {
  const transitions = ["wipe", "any", "outer", "wave"];
  const transition =
    transitions[Math.floor(Math.random() * transitions.length)];
  const fps = 144;
  const duration = 1;
  const swwwParams: string =
    `--transition-fps ${fps} --transition-type ${transition} --transition-duration ${duration}`;

  const currentMonitor = exec(["bash", "-c", `hyprctl -j activeworkspace | jq .monitor | tr -d '"'`])

  execAsync(["bash", "-c", `swww img -o ${currentMonitor} ${wallpaper} ${swwwParams}`])
    .then(() => { console.log(`Set wallpaper to ${wallpaper}`); })
    .catch((error) => { console.error(`Failed to set wallpaper: ${error}`); });

  if (currentMonitor === "DP-1") {
    execAsync(["bash", "-c", `rm /home/travis/.current_wallpaper && ln -s ${wallpaper} /home/travis/.current_wallpaper`])
  }
}

function ensureCacheDir() {
  const cacheDir = Gio.File.new_for_path(CACHE_DIR);
  if (!cacheDir.query_exists(null)) {
    cacheDir.make_directory_with_parents(null);
  }
}

function getThumbnailPath(wallpaper: string): string {
  const filename = wallpaper
    .split("/")
    .pop()!
    .replace(/[^a-zA-Z0-9.]/g, "_");
  return `${CACHE_DIR}/${filename}`;
}

function generateThumbnails(wallpaper: string, thumbnailPath: string): string {
  let pixbuf: GdkPixbuf.Pixbuf;
  try {
    pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(wallpaper, 150, 100, true);
  } catch (error) {
    console.log(`Failed to load ${wallpaper}: ${error}`);
    pixbuf = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, 150, 100); // Fallback
  }

  try {
    pixbuf.savev(thumbnailPath, "png", [], []);
  } catch (error) {
    console.error(`Failed to save thumbnail for ${wallpaper}: ${error}`);
  }
  return thumbnailPath;
}

function WallPaperButton({ wallpaper }: { wallpaper: string }) {
  const wallpaperTitle =
    wallpaper.split("/").pop()?.split(".")[0] || "Wallpaper";

  ensureCacheDir();
  const thumbnailPath = getThumbnailPath(wallpaper);

  // Check if thumbnail exists | Generate if not
  const thumbnailFile = Gio.File.new_for_path(thumbnailPath);
  if (!thumbnailFile.query_exists(null)) {
    console.log(`Generating thumbnail for ${wallpaper}`);
    generateThumbnails(wallpaper, thumbnailPath);
  }

  console.log(wallpaper);
  console.log(wallpaperTitle);
  console.log(thumbnailPath);

  return (
    <button
      className="WallPaperButton"
      onClicked={() => {
        set_wallpaper(wallpaper);
        hide();
      }}
    >
      <box vertical>
        <box
          valign={Gtk.Align.START}
          vexpand={false}
          className="title-container"
        >
          <label className="name" truncate xalign={0} label={wallpaperTitle} />
        </box>
        <box
          valign={Gtk.Align.CENTER}
          vexpand={true}
          className="preview-box"
          css={`
            background-image: url("${thumbnailPath}");
            background-size: cover;
            background-position: center;
            min-height: 100px;
            min-width: 150px;
          `}
        />
      </box>
    </button>
  );
}

function getWallpapersInDirectory(directory: string): string[] | undefined {
  try {
    const files = Gio.File.new_for_path(directory).enumerate_children(
      "standard::*",
      Gio.FileQueryInfoFlags.NONE,
      null,
    );

    const wallpaperFiles: string[] = [];
    let file: Gio.FileInfo | null;
    while ((file = files.next_file(null))) {
      if (file.get_file_type() === Gio.FileType.REGULAR) {
        wallpaperFiles.push(directory + "/" + file.get_name());
      }
    }
    wallpaperFiles.sort((a, b) => {
      const aName = a.split("/").pop()!.toLowerCase();
      const bName = b.split("/").pop()!.toLowerCase();
      return aName.localeCompare(bName);
    });
    return wallpaperFiles;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

export default function WallpaperSwitcher() {
  const wallpaperDirectory = "/home/travis/Pictures/wallpapers";
  const wallpapers = getWallpapersInDirectory(wallpaperDirectory) || [];
  const search = Variable<string>(""); // Reactive search variable

  return (
    <window
      name="wallpaper"
      application={App}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM}
      keymode={Astal.Keymode.ON_DEMAND}
      vexpand={false}
      hexpand={false}
      visible={false}
      onShow={(self) => {
        self.get_current_monitor().workarea.width;
      }}
      onKeyPressEvent={(self, event: Gdk.Event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) {
          hide();
        }
      }}
    >
      <box
        className="wallpaper-switcher"
        widthRequest={500}
        heightRequest={600}
        vexpand={false}
        hexpand={false}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        vertical // Main container is vertical
      >
        {/* Search Entry */}
        <entry
          placeholderText=" Search"
          text={bind(search)}
          onChanged={(self) => search.set(self.text ?? "")}
          widthRequest={450}
          hexpand
          onMap={(self) => {
            self.grab_focus();
          }}
        />
        {/* Three Columns */}
        <box spacing={10} halign={Gtk.Align.CENTER}>
          {bind(search).as((query) => {
            console.log(wallpapers);
            const filteredWallpapers = wallpapers
              .filter((wallpaper) =>
                wallpaper
                  .split("/")
                  .pop()!
                  .toLowerCase()
                  .includes(query.toLowerCase())
              )
              .slice(0, MAX_ITEMS); // Limit to 12 items
            
            // Split into three columns (up to 4 per column with MAX_ITEMS=12)
            console.log(filteredWallpapers);
            const itemsPerColumn = Math.ceil(filteredWallpapers.length / 3);
            const column1 = filteredWallpapers.slice(0, itemsPerColumn);
            const column2 = filteredWallpapers.slice(itemsPerColumn, itemsPerColumn * 2);
            const column3 = filteredWallpapers.slice(itemsPerColumn * 2);

            return [
              <box vertical spacing={6} className="wallpaper-column">
                {column1.map((wallpaper) => (
                  <WallPaperButton wallpaper={wallpaper} />
                ))}
              </box>,
              <box vertical spacing={6} className="wallpaper-column">
                {column2.map((wallpaper) => (
                  <WallPaperButton wallpaper={wallpaper} />
                ))}
              </box>,
              <box vertical spacing={6} className="wallpaper-column">
                {column3.map((wallpaper) => (
                  <WallPaperButton wallpaper={wallpaper} />
                ))}
              </box>,
            ];
          })}
        </box>
      </box>
    </window>
  );
}
