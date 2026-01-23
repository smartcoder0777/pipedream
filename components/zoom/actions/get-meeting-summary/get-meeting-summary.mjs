import zoom from "../../zoom.app.mjs";

export default {
  key: "zoom-get-meeting-summary",
  name: "Get Meeting Summary",
  description: "Retrieve the AI-generated summary for a specific meeting. Zoom's AI Companion must be enabled and the meeting must have a summary available. [See the documentation](https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingSummary)",
  version: "0.0.2",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    zoom,
    meetingId: {
      propDefinition: [
        zoom,
        "meetingId",
      ],
      description: "The meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. If a UUID starts with `/` or contains `//`, you must double-encode the meeting UUID before making an API request.",
      optional: false,
    },
  },
  async run({ $ }) {
    const {
      zoom,
      meetingId,
    } = this;

    const summary = await zoom.getMeetingSummary({
      $,
      meetingId,
    });

    $.export("$summary", `Successfully retrieved AI summary for meeting ${meetingId}`);
    return summary;
  },
};
