# Script to build event drive audio changes for better performance
import pulsectl
import subprocess
import os
import re
import time


def get_sink_input_by_name(pulse, app_name):
    for sink_input in pulse.sink_input_list():
        if (
            sink_input.proplist.get("application.process.binary").lower()
            == app_name.lower()
        ):
            return sink_input.index
    return None


def read_deej_sources():
    lineTriggering = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "-",
    ]
    # 0-4 are the sources, - is for multiple sources per slider.
    # All I need are the names of the applications configured
    # Only for the monitoring of the volume changes
    # Will need to parse again in ags for correct osd update
    uncleanedSources = []
    with open("/opt/deej/config.yaml", "r") as file:
        lines = file.readlines()
        for line in lines:
            strippedLine = line.strip()
            if strippedLine and strippedLine[0] in lineTriggering:
                if strippedLine[-1] != ":":
                    uncleanedSources.append(strippedLine)

    sources = [re.sub(r"^\d+: |^- ", "", line) for line in uncleanedSources]
    return sources


def main():
    current_time = time.time()
    application_names = read_deej_sources()
    print(f"Monitoring these sources: {application_names}")

    with pulsectl.Pulse("volume-monitor") as pulse:
        sink_input_indecies = {
            get_sink_input_by_name(pulse, app)
            for app in application_names
            if app != "master"
        }
        sink_input_indecies.discard(None)
        print(f"Found sink inputs: {sink_input_indecies}")

        if not sink_input_indecies:
            print("No sink inputs found")

        def volume_event(ev):
            if (
                ev.facility == "sink_input"
                and ev.t == "change"
                and ev.index in sink_input_indecies
            ):
                # Don't worry about the mixing of python and shell scripts
                script_path = os.path.expanduser("~/.config/ags/scripts/updateVolumeLevel.sh")
                process = subprocess.Popen(
                    [
                        script_path,
                        str(ev.index),
                    ],
                    stdout=subprocess.PIPE,
                )
                stdout = process.communicate()[0]
                print(stdout.decode("utf-8"))

        pulse.event_mask_set("sink-input")
        pulse.event_callback_set(volume_event)

        last_refresh_time = time.time()
        while True:
            try:
                pulse.event_listen(timeout=0.01)

                # Refresh sources every second
                if time.time() - last_refresh_time >= 1:
                    last_refresh_time = time.time()
                    application_names = read_deej_sources()
                    updated_sink_input_indecies = {
                        get_sink_input_by_name(pulse, app)
                        for app in application_names
                        if app != "master"
                    }
                    updated_sink_input_indecies.discard(None)

                    if updated_sink_input_indecies != sink_input_indecies:
                        print(f"Found sink inputs: {updated_sink_input_indecies}")
                        sink_input_indecies = updated_sink_input_indecies
            except KeyboardInterrupt:
                break


if __name__ == "__main__":
    main()
