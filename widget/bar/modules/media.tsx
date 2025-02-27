import { bind } from "astal";
import { Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";

export default function Media() {
  const mpris = Mpris.get_default();

  return (
    <box className="Media" visible={bind(mpris, "players").as((ps) => !!ps[0])}>
      {bind(mpris, "players").as((ps) =>
        ps[0] ? (
          <box>
            <box
              className="Cover"
              valign={Gtk.Align.CENTER}
              css={bind(ps[0], "coverArt").as(
                (cover) => `background-image: url('${cover}');`,
              )}
            />
            <label
              label={bind(ps[0], "metadata").as(
                () => ` ${ps[0].title.substring(0,35)} || 󰳩 ${ps[0].artist.substring(0,20)}`,
              )}
            />
          </box>
        ) : (
          <label label="Nothing Playing" />
        ),
      )}
    </box>
  );
}
