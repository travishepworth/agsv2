import { Variable, bind, execAsync } from "astal";

export default function Logo() {
  // State to track if the logo is clicked (optional, for future expansion)
  const isClicked = Variable<boolean>(false);

  // Function to handle logo click (placeholder for now)
  const launchPowerMenu = () => {
    execAsync(["bash", "-c", "ags toggle power-menu"]); // Dummy command
  };

  return (
    <box className="Logo">
      <button
        onClicked={launchPowerMenu}
        label="󰣇" // Nerd Font logo/icon (e.g., Arch Linux logo, or customize as needed)
      />
    </box>
  );
}
