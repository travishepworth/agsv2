import { App } from "astal/gtk3";
import { Variable, bind } from "astal";
import { Astal, Gtk, Gdk } from "astal/gtk3";
import TextInput from "./modules/textBox";
import ChatGPTDisplay from "./modules/chatGPT";
import { fetchBooruResponse, fetchChatGPTResponse } from "./modules/api";
import APISwitcher from "./modules/apiSwitcher";
import BooruDisplay from "./modules/booru";

export default function LeftPanel(monitor: Gdk.Monitor) {
  const { CENTER } = Gtk.Align;
  const isVisible = Variable<boolean>(false);

  // Calculate the width of the panel (e.g., half the screen width, adjustable)
  const panelWidth = Variable(20); // Default width, adjustable as needed
  const barHeight = 40;
  const offset = 6;
  const promptText = Variable<string>("");
  const chatResponse = Variable<string>("Waiting for response...");
  const booruResponse = Variable<string>("Waiting for image...");
  const selectedAPI = Variable<"chatGPT" | "booru">("chatGPT");

  const handleTextSubmit = async (text: string) => {
    promptText.set(text);
    if (selectedAPI.get() === "chatGPT") {
      const response = await fetchChatGPTResponse(text);
      chatResponse.set(response);
    } else {
      const response = await fetchBooruResponse(text);
      booruResponse.set(response);
    }
  };

  return (
    <window
      name="leftPanel"
      className="LeftPanel"
      visible={false}
      anchor={
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      marginTop={barHeight + offset}
      marginBottom={offset}
      marginLeft={10}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.ON_DEMAND}
      application={App}
      onKeyPressEvent={(self, event: Gdk.Event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) self.hide();
      }}
    >
      <box>
        <eventbox expand onClick={() => isVisible.set(false)} />{" "}
        {/* Click outside to hide */}
        <box hexpand={true} vertical>
          <box halign={CENTER} marginTop={10}>
            <APISwitcher
              selected={selectedAPI}
              onSelect={(option) => selectedAPI.set(option)}
            />
          </box>
          {bind(selectedAPI).as((api) =>
            api === "chatGPT" ? (
              <ChatGPTDisplay response={chatResponse} />
            ) : (
              <BooruDisplay response={booruResponse} />
            )
          )}
          <eventbox hexpand={true} vexpand={true}>
            <box halign={CENTER} valign={Gtk.Align.END}>
              <TextInput onSubmit={handleTextSubmit} />
            </box>
          </eventbox>
        </box>
      </box>
    </window>
  );
}
