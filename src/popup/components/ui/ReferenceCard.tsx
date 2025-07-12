
// ReferenceCard.tsx
import { ScrollText, Link as LinkIcon } from "lucide-react";

export interface ReferenceCardProps {
  type: "note" | "web";
  url: string;
  content: string;
}

export default function ReferenceCard({ type, url, content }: ReferenceCardProps) {
  return (
    <div
      onClick={() => window.open(url, "_blank")}
      className="bg-chat-message flex-shrink-0 flex flex-row gap-1 items-start rounded-xl p-2 w-[250px] cursor-pointer"
    >
      {type === "note" ? (
        <ScrollText className="w-6 h-6 flex-shrink-0 pt-1" />
      ) : (
        <LinkIcon className="w-6 h-6 flex-shrink-0 pt-1" />
      )}
      <div className="flex flex-col gap-2 justify-start items-start w-full px-2">
        <span className="text-text-primary">
          {type === "note" ? "Reference Notes" : "Reference Web"}
        </span>
        <span className="text-text-secondary text-sm w-full line-clamp-2">
          {type === "note" ? content : url.split("//")[1].split("/")[0]}
        </span>
      </div>
    </div>
  );
}