import { Gtk } from "astal/gtk3";
import { Variable, bind } from "astal";

// Replace with your OpenAI API key


export default function ChatGPTDisplay({ response }: {response: Variable<string> }) {
  return (
    <box className="ChatGPTDisplay" vertical spacing={5}>
      <label
        label={bind(response)}
        wrap={true}
        halign={Gtk.Align.CENTER}
        className="ChatResponse"
      />
    </box>
  );
}
