/**
 * Score Tracker - Track and persist game scores.
 *
 * Manages high scores, achievements, and player statistics.
 */

class ScoreTracker {
    constructor(maxHighScores = 10) {
        this.maxHighScores = maxHighScores;
        this.storageKey = 'tech_ghost_scores';
        this.achievementsKey = 'tech_ghost_achievements';
        this.scoreHistory = [];
        this.scores = [];
        this.achievements = [];

        this.loadScores();
        this.loadAchievements();
    }

    recordScore(playerName, score, level, wordsTyped) {
        const scoreEntry = {
            playerName,
            score,
            level,
            wordsTyped,
            timestamp: new Date().toISOString(),
            id: this.generateId(),
        };

        this.scoreHistory.push(scoreEntry);
        this.refreshLeaderboard();

        this.saveScores();
        this.checkAchievements(scoreEntry);

        return this.getRank(scoreEntry.score);
    }

    getHighScores(limit) {
        const count = limit || this.maxHighScores;
        return this.scores.slice(0, count);
    }

    getPlayerBestScore(playerName) {
        const playerScores = this.scores.filter((entry) => entry.playerName === playerName);

        if (playerScores.length === 0) {
            return null;
        }

        return playerScores[0].score;
    }

    getPlayerStats(playerName) {
        const playerScores = this.scoreHistory.filter((entry) => entry.playerName === playerName);

        if (playerScores.length === 0) {
            return null;
        }

        const totalGames = playerScores.length;
        const totalScore = playerScores.reduce((sum, entry) => sum + entry.score, 0);
        const avgScore = totalScore / totalGames;
        const bestScore = playerScores.reduce(
            (max, entry) => Math.max(max, entry.score),
            playerScores[0].score,
        );
        const totalWords = playerScores.reduce((sum, entry) => sum + (entry.wordsTyped || 0), 0);

        return {
            playerName,
            totalGames,
            totalScore,
            avgScore: Math.round(avgScore),
            bestScore,
            totalWords,
            achievements: this.getPlayerAchievements(playerName),
        };
    }

    checkAchievements(scoreEntry) {
        const newAchievements = [];

        if (scoreEntry.score >= 1000 && !this.hasAchievement(scoreEntry.playerName, 'score_1000')) {
            newAchievements.push(
                this.unlockAchievement(scoreEntry.playerName, 'score_1000', '1000 Point Master'),
            );
        }

        if (scoreEntry.score >= 5000 && !this.hasAchievement(scoreEntry.playerName, 'score_5000')) {
            newAchievements.push(
                this.unlockAchievement(scoreEntry.playerName, 'score_5000', 'Elite Scorer'),
            );
        }

        if (scoreEntry.level >= 10 && !this.hasAchievement(scoreEntry.playerName, 'level_10')) {
            newAchievements.push(
                this.unlockAchievement(scoreEntry.playerName, 'level_10', 'Level 10 Achiever'),
            );
        }

        const playerScores = this.scoreHistory.filter(
            (entry) => entry.playerName === scoreEntry.playerName,
        );

        if (playerScores.length >= 10 && !this.hasAchievement(scoreEntry.playerName, 'games_10')) {
            newAchievements.push(
                this.unlockAchievement(scoreEntry.playerName, 'games_10', 'Dedicated Player'),
            );
        }

        return newAchievements;
    }

    unlockAchievement(playerName, achievementId, achievementName) {
        const achievement = {
            playerName,
            achievementId,
            achievementName,
            unlockedAt: new Date().toISOString(),
        };

        this.achievements.push(achievement);
        this.saveAchievements();

        return achievement;
    }

    hasAchievement(playerName, achievementId) {
        return this.achievements.some(
            (achievement) =>
                achievement.playerName === playerName && achievement.achievementId === achievementId,
        );
    }

    getPlayerAchievements(playerName) {
        return this.achievements.filter((achievement) => achievement.playerName === playerName);
    }

    getRank(score) {
        const rank = this.scores.findIndex((entry) => entry.score === score) + 1;
        return rank > 0 ? rank : null;
    }

    clearScores() {
        this.scoreHistory = [];
        this.scores = [];
        this.saveScores();
    }

    clearAchievements() {
        this.achievements = [];
        this.saveAchievements();
    }

    loadScores() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const parsedScores = data ? JSON.parse(data) : [];

            this.scoreHistory = this.normalizeScores(parsedScores);
            this.refreshLeaderboard();
        } catch (error) {
            console.error('Failed to load scores:', error);
            this.scoreHistory = [];
            this.scores = [];
        }
    }

    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scoreHistory));
        } catch (error) {
            console.error('Failed to save scores:', error);
        }
    }

    loadAchievements() {
        try {
            const data = localStorage.getItem(this.achievementsKey);
            const parsedAchievements = data ? JSON.parse(data) : [];
            this.achievements = Array.isArray(parsedAchievements) ? parsedAchievements : [];
        } catch (error) {
            console.error('Failed to load achievements:', error);
            this.achievements = [];
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem(this.achievementsKey, JSON.stringify(this.achievements));
        } catch (error) {
            console.error('Failed to save achievements:', error);
        }
    }

    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    exportData() {
        return {
            scores: this.scoreHistory,
            achievements: this.achievements,
            exportedAt: new Date().toISOString(),
        };
    }

    importData(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return false;
        }

        if (Object.prototype.hasOwnProperty.call(data, 'scores')) {
            if (!Array.isArray(data.scores)) {
                return false;
            }

            this.scoreHistory = this.normalizeScores(data.scores);
            this.refreshLeaderboard();
            this.saveScores();
        }

        if (Object.prototype.hasOwnProperty.call(data, 'achievements')) {
            if (!Array.isArray(data.achievements)) {
                return false;
            }

            this.achievements = data.achievements;
            this.saveAchievements();
        }

        return true;
    }

    normalizeScores(scores) {
        if (!Array.isArray(scores)) {
            return [];
        }

        return scores
            .filter((entry) => entry && typeof entry === 'object' && Number.isFinite(entry.score))
            .map((entry) => ({
                ...entry,
                score: Number(entry.score),
            }))
            .sort((first, second) => second.score - first.score);
    }

    refreshLeaderboard() {
        this.scores = this.scoreHistory.slice(0, this.maxHighScores);
    }
}

// Export for use in other modules.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreTracker;
}
