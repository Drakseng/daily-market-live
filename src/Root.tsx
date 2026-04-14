import "./index.css";
import { Composition } from "remotion";
import { BistMarketSummary } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BistMarketSummary"
      component={BistMarketSummary}
      durationInFrames={30 * 30}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
