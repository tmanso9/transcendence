import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameDTO } from './dto';

enum GameScore {
	WIN = 3,
	LOSE = -1
};

export const Achievements = {
	// Streak
	ON_FIRE: "On Fire",	// 5 to 10 win streak
	UNSTOPPABLE: "Unstoppable",	// 10 win streak
	TRANSCENDENT: "Transcendent",

	// Games played
	NOVICE: "Novice",		// Less than 5 games
	REGULAR: "Regular",	// 5 to 10 games
	ENTHUSIAST: "Enthusiast",	// 10 to 30 games
	VETERAN: "Veteran",	// 30 to 50 games
	GRANDMASTER: "Grandmaster",	// 50+ games

	// Win ratio
	CONSISTENT: "Consistent",	// 0.5 to 0.65
	DOMINANT: "Dominant",	// 0.65 to 0.85
	UNBREAKABLE: "Unbreakable",	// 0.85+
}

@Injectable()
export class GameBackendService {
	constructor(
		private prismaService: PrismaService,
	) {}

	async createGame(data: GameDTO) {
		try {
			// Add game to the database
			const game = await this.prismaService.games.create({
				data: {
					winnerId: data.winnerId,
					loserId: data.loserId,
					loserScore: data.loserScore,
					winnerUsername: data.winnerUsername,
					loserUsername: data.loserUsername,
				}
			});

			// Update winner
			await this.updatePlayerStats(data.winnerId, true, GameScore.WIN);
			await this.updatePlayerStats(data.loserId, false, GameScore.LOSE);

		} catch(error) {
			console.log(error);
			throw new ForbiddenException('Something went wrong');
		}
	}

	private async updatePlayerStats(playerId: string, winner: boolean, score: number) {
		const player = await this.prismaService.user.findUnique({
			where: {
				id: playerId
			},
			include: {
				gamestats: true
			},
		})

		if (!player)
			throw new ForbiddenException('Player does not exist');

		const updated_score = Math.max(player.gamestats.points + score, 0);
		let updated_wins: number, updated_losses: number, updated_streak: number;

		// Update stats
		if (winner) {
			updated_wins = player.gamestats.wins + 1;
			updated_streak = player.gamestats.streak + 1;
			await this.prismaService.gamestats.update({
				where: {
					id: player.gamestats.id
				},
				data: {
					points: updated_score,
					wins: updated_wins,
					streak: updated_streak,
				}
			});

		} else {
			updated_losses = player.gamestats.losses + 1;
			updated_streak = 0;
			await this.prismaService.gamestats.update({
				where: {
					id: player.gamestats.id
				},
				data: {
					points: updated_score,
					losses: updated_losses,
					streak: updated_streak
				}
			})
		}

		// Check if the outcome of the game changes the rank of the player
		const updated_rank = this.getRank(updated_score);
		const total_wins = winner ? updated_wins : player.gamestats.wins;
		const total_losses = winner ? player.gamestats.losses : updated_losses;
		const updated_achievements = this.getAchievements(player.achievements, updated_streak, total_wins, total_losses + total_wins);
		if (updated_rank !== player.rank) {
			// Update player rank
			await this.prismaService.user.update({
				where: {
					id: playerId
				},
				data: {
					rank: updated_rank,
					achievements: updated_achievements
				}
			})
		} else {
			await this.prismaService.user.update({
				where: {
					id: playerId
				},
				data: {
					achievements: updated_achievements
				}
			})
		}
	}

	private getRank(points: number): string {
		if (0 <= points && points < 20)
			return 'NOOBIE';
		else if (20 <= points && points < 50)
			return 'PRO';
		else if (50 <= points)
			return 'GURU';
	}

	// TODO: FINISH IMPLEMENTATION
	private getAchievements(old_achievements: any, updated_streak: number, total_wins: number, total_games: number): {} {
		return {
			social: old_achievements.social,
			games_played: this.getGamesPlayedAchievement(total_games),
			ratio: this.getRatioAchievement(total_wins / total_games),
			streak: this.getStreakAchievements(updated_streak)
		};
	}

	private getStreakAchievements(win_streak: number): string {
		if (5 <= win_streak && win_streak < 10)
			return Achievements["ON_FIRE"];
		else if (10 <= win_streak && win_streak < 20)
			return Achievements["UNSTOPPABLE"];
		else if (20 <= win_streak)
			return Achievements["TRANSCENDENT"];
		else
			return null;
	}

	private getGamesPlayedAchievement(total_games: number): string {
		if (total_games < 5)
			return Achievements["NOVICE"];
		else if (5 <= total_games && total_games < 10)
			return Achievements["REGULAR"];
		else if (10 <= total_games && total_games < 30)
			return Achievements["ENTHUSIAST"];
		else if (30 <= total_games && total_games < 50)
			return Achievements["VETERAN"];
		else
			return Achievements["GRANDMASTER"];
	}

	private getRatioAchievement(win_ratio: number): string {
		if (0.5 <= win_ratio && win_ratio < 0.65)
			return Achievements["CONSISTENT"];
		else if (0.65 <= win_ratio && win_ratio < 0.85)
			return Achievements["DOMINANT"]
		else if (0.85 <= win_ratio)
			return Achievements["UNBREAKABLE"]
		else
			return null;
	}

	async getUserGames(id: string) {
		const games = await this.prismaService.games.findMany({
		where: {
			OR: [
				{ winnerId: id },
				{ loserId: id },
			],
		},
		});

		return games
  }
}
