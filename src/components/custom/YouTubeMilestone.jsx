import { Button } from "@/components/ui/button";

const YouTubeMilestone = () => {
  return (
    // This is the entire left column.
    // 'space-y-8' adds space between the iframe and the text
    <div className="flex flex-col space-y-12">
      {/* Top: Live subscriber counter */}
      <div className="rounded-2xl shadow-lg flex justify-center items-center bg-white p-0 w-full overflow-hidden">
        <iframe
          title="YouTube Live Subscriber Counter"
          src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCgiy__oSdBGDmWT9gj_yvWA"
          frameBorder="0"
          className="rounded-xl border-0 w-full aspect-[3/1]"
        ></iframe>
      </div>

      {/* Bottom: Channel milestone text */}
      <div className="text-center mx-auto md:text-left">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          🎉 We Hit a New Milestone!
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Vaishali’s Crochet family has grown to over{" "}
          <span className="font-semibold text-orange-600">42,000+</span>{" "}
          amazing subscribers! 🌸
          <br />
          Thank you for being part of this creative journey — your support
          keeps our hooks and hearts moving.
        </p>
        <Button
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 py-2"
          onClick={() =>
            window.open(
              "https://youtube.com/@vaishaliscrochet1666?si=rGxV6E0yaeazzyzc",
              "_blank"
            )
          }
        >
          Visit Channel
        </Button>
      </div>
    </div>
  );
};

export default YouTubeMilestone;