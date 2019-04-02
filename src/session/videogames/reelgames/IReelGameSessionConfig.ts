import {IGameSessionConfig} from "../../IGameSessionConfig";
import {IReelGameSessionWinCalculatorConfig} from "./wincalculator/IReelGameSessionWinCalculatorConfig";
import {IReelGameSessionReelsControllerConfig} from "./reelscontroller/IReelGameSessionReelsControllerConfig";

export interface IReelGameSessionConfig extends IGameSessionConfig, IReelGameSessionWinCalculatorConfig, IReelGameSessionReelsControllerConfig {

    isItemWild(itemId): boolean;

    isItemScatter(itemId): boolean;

}
