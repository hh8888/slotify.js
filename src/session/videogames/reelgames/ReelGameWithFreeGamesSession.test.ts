import {IReelGameSessionConfig} from "./IReelGameSessionConfig";
import {ReelGameSessionReelsController} from "./reelscontroller/ReelGameSessionReelsController";
import {ReelGameSessionWinCalculator} from "./wincalculator/ReelGameSessionWinCalculator";
import {ReelGameWithFreeGamesSession} from "./ReelGameWithFreeGamesSession";
import {IReelGameWithFreeGamesSessionConfig} from "./IReelGameWithFreeGamesSessionConfig";
import {IReelGameWithFreeGamesSession} from "./IReelGameWithFreeGamesSession";
import {
    testDefaultSession,
    testSessionWithSpecifiedConfig,
    testSessionWithWrongInitialBet
} from "../../GameSession.test";
import {testDefaultReelGameSession, testPlayUntilWin} from "./ReelGameSession.test";
import {ReelGameWithFreeGamesSessionConfig} from "./ReelGameWithFreeGamesSessionConfig";

const testDefaultReelGameWithFreeGamesSession = (sessionClass, configClass) => {
    const config: IReelGameWithFreeGamesSessionConfig = new configClass();
    const session: IReelGameWithFreeGamesSession = new sessionClass(config, new ReelGameSessionReelsController(config), new ReelGameSessionWinCalculator(config));
    expect(session.getFreeGameNum()).not.toBeDefined();
    expect(session.getFreeGameSum()).not.toBeDefined();
    expect(session.getFreeGameBank()).not.toBeDefined();
};

const testFreeGamesGettersSetters = (sessionClass, configClass) => {
    const config: IReelGameWithFreeGamesSessionConfig = new configClass();
    const session: IReelGameWithFreeGamesSession = new sessionClass(config, new ReelGameSessionReelsController(config), new ReelGameSessionWinCalculator(config));
    session.setFreeGameBank(100);
    session.setFreeGameNum(5);
    session.setFreeGameSum(10);
    expect(session.getFreeGameSum()).toBe(10);
    expect(session.getFreeGameNum()).toBe(5);
    expect(session.getFreeGameBank()).toBe(100);
};

const testPlayUntilWinFreeGames = (sessionClass, configClass) => {
    const config: IReelGameSessionConfig = new configClass();
    config.creditsAmount = Infinity;
    const session: IReelGameWithFreeGamesSession = new sessionClass(config, new ReelGameSessionReelsController(config), new ReelGameSessionWinCalculator(config));
    while (session.getFreeGameSum() === 0 || session.getFreeGameSum() === undefined) {
        session.play();
    }
    expect(session.getFreeGameNum()).toBe(0);
    expect(session.getFreeGameSum()).toBeGreaterThan(0);
};

const testPlayFreeGames = (sessionClass, configClass) => {
    const config: IReelGameWithFreeGamesSessionConfig = new configClass();
    config.creditsAmount = Infinity;
    config.reelsItemsSequences = ReelGameSessionReelsController.createItemsSequences(config.reelsNumber, config.availableItems, {
        0: {
            "S": 0
        },
        4: {
            "S": 0
        },
    });
    const session: IReelGameWithFreeGamesSession = new sessionClass(config, new ReelGameSessionReelsController(config), new ReelGameSessionWinCalculator(config));

    //The following situations need to be checked:
    let wasNormalFreeGames: boolean; //played normal 10 free games
    let wasAdditionalFreeGames: boolean; //free games was won again at free games mode
    let wasFreeBank: boolean; //was any winning during free games mode
    let wasNoFreeBank: boolean; //was no winnings during free games mode
    while (!wasNormalFreeGames || !wasAdditionalFreeGames || !wasFreeBank || !wasNormalFreeGames) {
        while (session.getFreeGameSum() === 0 || session.getFreeGameSum() === undefined || (session.getFreeGameSum() > 0 && session.getFreeGameNum() === session.getFreeGameSum())) { //Play until won free games
            session.play();
        }
        let playedFreeGamesCount: number = 0;
        let expectedPlayedFreeGamesCount: number = session.getFreeGameSum();
        let lastFreeBank: number = 0;
        let creditsBeforeFreeGame: number = session.getCreditsAmount();
        while (session.getFreeGameSum() > 0 && session.getFreeGameNum() !== session.getFreeGameSum()) { //Play until end of free games
            lastFreeBank = session.getFreeGameBank();
            session.play();
            expect(session.getFreeGameBank()).toBe(lastFreeBank + session.getWinningAmount());
            expect(session.getCreditsAmount()).toBe(creditsBeforeFreeGame); //Bet should not be subtracted in at free games mode
            playedFreeGamesCount++;
            if (session.getFreeGameSum() > expectedPlayedFreeGamesCount) {
                wasAdditionalFreeGames = true;
                expectedPlayedFreeGamesCount = session.getFreeGameSum();
                expect(Object.keys(session.getWinningScatters()).length).toBeGreaterThan(0);
                Object.keys(config.freeGamesForScatters).forEach(scatterId => {
                    expect(session.getWinningScatters()).toHaveProperty(scatterId);
                    expect(config.freeGamesForScatters[scatterId]).toHaveProperty(session.getWinningScatters()[scatterId].itemsPositions.length.toString());
                    expect(session.getWonFreeGamesNumber()).toBe(config.freeGamesForScatters[scatterId][session.getWinningScatters()[scatterId].itemsPositions.length]);
                });
            } else {
                wasNormalFreeGames = true;
            }
        }

        if (lastFreeBank === 0) {
            wasNoFreeBank = true;
        } else {
            wasFreeBank = true;
        }

        expect(session.getCreditsAmount()).toBe(creditsBeforeFreeGame + lastFreeBank);
        expect(playedFreeGamesCount).toBe(expectedPlayedFreeGamesCount);
    }
};

describe("ReelGameWithFreeGamesSession", () => {
    const sessionClass = ReelGameWithFreeGamesSession;
    const configClass = ReelGameWithFreeGamesSessionConfig;

    it("pass base tests", () => {
        testDefaultSession(sessionClass, configClass);
        testSessionWithSpecifiedConfig(sessionClass, configClass);
        testSessionWithWrongInitialBet(sessionClass, configClass);
        testDefaultReelGameSession(sessionClass, configClass);
        testPlayUntilWin(sessionClass, class A extends ReelGameWithFreeGamesSessionConfig {
            //Base test will not be passed because credits are not decremented at free games mode
            //Disabling free game for pass base test
            public set freeGamesForScatters(value: { [p: string]: { [p: number]: number } }) {
            }

            public get freeGamesForScatters(): { [p: string]: { [p: number]: number } } {
                return null;
            }
        });
    });

    it("sets free games num/sum/bank", () => {
        testFreeGamesGettersSetters(sessionClass, configClass);
    });

    it("creates default reel game with free games session", () => {
        testDefaultReelGameWithFreeGamesSession(sessionClass, configClass);
    });

    it("should several times play until won free games", () => {
        testPlayUntilWinFreeGames(sessionClass, configClass);
    });

    it("should play free games mode as expected", () => {
        testPlayFreeGames(sessionClass, configClass);
    });

});
