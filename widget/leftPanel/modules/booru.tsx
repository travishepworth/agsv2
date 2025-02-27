import { Gtk } from "astal/gtk3";
import { Variable, bind } from "astal";

export default function BooruDisplay({
  response,
}: {
  response: Variable<string>;
}) {
  return (
    <box
      className="booru"
      vertical
      spacing={5}
      halign={Gtk.Align.CENTER}
      css={bind(response).as(
        (filePath) => `
        background-image: url('file://${filePath}');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        min-height: 400px;
        min-width: 400px;
      `,
      )}
    >
      <label label="Booru" halign={Gtk.Align.CENTER} />
      {bind(response).as(
        (filePath) => (
          console.log("Loading image from", filePath),
          (
            <Gtk.Image
              file={filePath}
              pixelSize={200}
              halign={Gtk.Align.CENTER}
            />
          )
        ),
      )}
    </box>
  );
}
