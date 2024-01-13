import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameDTO } from './dto';

enum GameScore {
	WIN = 3,
	LOSE = -1
};

enum Achievements {
	ON_FIRE,

	NOVICE,
	REGULAR,
	ENTHUSIAST,
	VETERAN,
	GRANDMASTER,

	CONSISTENT,
	DOMINANT,
	UNBREAKABLE,

	SOCIALITE
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
					loserScore: data.loserScore
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
		// TODO: DECIDE VERIFICATION FUNCTION
		const updated_rank = this.getRank(updated_score);
		const updated_achievements = this.getAchievements(player.achievements, updated_streak);
		if (updated_rank !== player.rank) {
			// Update player rank
			await this.prismaService.user.update({
				where: {
					id: playerId
				},
				data: {
					rank: updated_rank,
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
	private getAchievements(old_achievements: {}, updated_streak: number, ): {} {
		const updated_achievements = {};
		return updated_achievements;
	}
}
