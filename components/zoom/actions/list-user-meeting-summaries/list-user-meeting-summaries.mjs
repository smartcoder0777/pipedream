import zoom from "../../zoom.app.mjs";

export default {
  key: "zoom-list-user-meeting-summaries",
  name: "List User Meeting Summaries",
  description: "Retrieve AI-generated meeting summaries for a specific user's cloud recordings within a date range. This action lists recordings that have AI summaries available. [See the documentation](https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/recordingsList)",
  version: "0.0.1",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    zoom,
    userId: {
      propDefinition: [
        zoom,
        "userId",
      ],
      description: "The user ID or email address of the user. For user-level apps, pass the `me` value.",
    },
    from: {
      type: "string",
      label: "From Date",
      description: "Start date in `yyyy-MM-dd` format. The date range defined by the `from` and `to` parameters should only be one month as the report includes only one month worth of data at once. Example: `2024-01-01`",
    },
    to: {
      type: "string",
      label: "To Date",
      description: "End date in `yyyy-MM-dd` format. Example: `2024-01-31`",
    },
    max: {
      propDefinition: [
        zoom,
        "max",
      ],
      description: "The maximum number of recordings to retrieve. Default is 300.",
    },
  },
  methods: {
    listUserRecordings({
      userId, ...args
    }) {
      return this.zoom._makeRequest({
        path: `/users/${userId}/recordings`,
        ...args,
      });
    },
  },
  async run({ $ }) {
    const {
      zoom,
      userId,
      from,
      to,
      max,
    } = this;

    const recordings = [];
    let count = 0;

    const results = zoom.getResourcesStream({
      resourceFn: zoom.listUserRecordings,
      resourceFnArgs: {
        $,
        userId,
        params: {
          from,
          to,
        },
      },
      resourceName: "meetings",
      max,
    });

    for await (const meeting of results) {
      // Only include meetings that have summaries available
      if (meeting.recording_files?.some((file) => file.file_type === "SUMMARY")) {
        recordings.push({
          meeting_id: meeting.id,
          meeting_uuid: meeting.uuid,
          topic: meeting.topic,
          start_time: meeting.start_time,
          duration: meeting.duration,
          host_id: meeting.host_id,
          total_size: meeting.total_size,
          recording_count: meeting.recording_count,
          summary_files: meeting.recording_files.filter((file) => file.file_type === "SUMMARY"),
        });
        count++;
      }

      if (count >= max) {
        break;
      }
    }

    $.export("$summary", `Successfully retrieved ${count} meeting${count === 1
      ? ""
      : "s"} with summaries for user ${userId}`);

    return recordings;
  },
};
