import {ReelGameSessionConfig} from "./ReelGameSessionConfig";
import {IReelGameWithFreeGamesSessionConfig} from "./IReelGameWithFreeGamesSessionConfig";
import {ReelGameWithFreeGamesSessionConfig} from "./ReelGameWithFreeGamesSessionConfig";

describe("ReelGameSessionConfig", () => {

    it("creates default config", () => {
        const conf: IReelGameWithFreeGamesSessionConfig = new ReelGameWithFreeGamesSessionConfig();
        expect(conf.freeGamesForScatters).toEqual({
            "s": {
                3: 10
            }
        });
    });

});