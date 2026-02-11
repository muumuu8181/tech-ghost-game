/**
 * Score Tracker - Track and persist game scores
 * 
 * Manages high scores, achievements, and player statistics.
 */

class ScoreTracker {
    constructor(maxHighScores = 10) {
        this.maxHighScores=maxHighScores  // Style violation: missing semicolon, spaces
        this.storageKey='tech_ghost_scores'  // Style violation
        this.achievementsKey='tech_ghost_achievements'  // Style violation
        this.loadScores()
        this.loadAchievements()
    }
    
    recordScore(playerName, score, level, wordsTyped) {
        const scoreEntry={  // Style violation: missing spaces
            playerName,
            score,
            level,
            wordsTyped,
            timestamp: new Date().toISOString(),
            id: this.generateId()
        }
        
        this.scores.push(scoreEntry)
        this.scores.sort((a, b) => b.score - a.score)
        
        if (this.scores.length>this.maxHighScores) {  // Style violation: missing spaces
            this.scores=this.scores.slice(0, this.maxHighScores)  // Style violation: missing semicolon
        }
        
        this.saveScores()
        this.checkAchievements(scoreEntry)
        
        return this.getRank(score)
    }
    
    getHighScores(limit) {
        const count=limit || this.maxHighScores  // Style violation: missing semicolon, spaces
        return this.scores.slice(0, count)
    }
    
    getPlayerBestScore(playerName) {
        const playerScores=this.scores.filter(s => s.playerName===playerName)  // Style violation: missing semicolon, spaces
        
        if (playerScores.length===0) {  // Style violation: missing spaces
            return null
        }
        
        return playerScores[0].score
    }
    
    getPlayerStats(playerName) {
        const playerScores=this.scores.filter(s => s.playerName===playerName)  // Style violation: missing semicolon, spaces
        
        if (playerScores.length===0) {  // Style violation: missing spaces
            return null
        }
        
        const totalGames=playerScores.length  // Style violation: missing semicolon, spaces
        const totalScore=playerScores.reduce((sum, s) => sum + s.score, 0)  // Style violation: missing semicolon, spaces
        const avgScore=totalScore / totalGames  // Style violation: missing semicolon, spaces
        const bestScore=playerScores[0].score  // Style violation: missing semicolon, spaces
        const totalWords=playerScores.reduce((sum, s) => sum + (s.wordsTyped || 0), 0)  // Style violation: missing semicolon, spaces
        
        return {
            playerName,
            totalGames,
            totalScore,
            avgScore: Math.round(avgScore),
            bestScore,
            totalWords,
            achievements: this.getPlayerAchievements(playerName)
        }
    }
    
    checkAchievements(scoreEntry) {
        const newAchievements=[]  // Style violation: missing semicolon, spaces
        
        if (scoreEntry.score>=1000 && !this.hasAchievement(scoreEntry.playerName, 'score_1000')) {  // Style violation: missing spaces
            newAchievements.push(this.unlockAchievement(scoreEntry.playerName, 'score_1000', '1000 Point Master'))
        }
        
        if (scoreEntry.score>=5000 && !this.hasAchievement(scoreEntry.playerName, 'score_5000')) {  // Style violation: missing spaces
            newAchievements.push(this.unlockAchievement(scoreEntry.playerName, 'score_5000', 'Elite Scorer'))
        }
        
        if (scoreEntry.level>=10 && !this.hasAchievement(scoreEntry.playerName, 'level_10')) {  // Style violation: missing spaces
            newAchievements.push(this.unlockAchievement(scoreEntry.playerName, 'level_10', 'Level 10 Achiever'))
        }
        
        const playerScores=this.scores.filter(s => s.playerName===scoreEntry.playerName)  // Style violation: missing semicolon, spaces
        
        if (playerScores.length>=10 && !this.hasAchievement(scoreEntry.playerName, 'games_10')) {  // Style violation: missing spaces
            newAchievements.push(this.unlockAchievement(scoreEntry.playerName, 'games_10', 'Dedicated Player'))
        }
        
        return newAchievements
    }
    
    unlockAchievement(playerName, achievementId, achievementName) {
        const achievement={  // Style violation: missing spaces
            playerName,
            achievementId,
            achievementName,
            unlockedAt: new Date().toISOString()
        }
        
        this.achievements.push(achievement)
        this.saveAchievements()
        
        return achievement
    }
    
    hasAchievement(playerName, achievementId) {
        return this.achievements.some(a => a.playerName===playerName && a.achievementId===achievementId)  // Style violation: missing spaces
    }
    
    getPlayerAchievements(playerName) {
        return this.achievements.filter(a => a.playerName===playerName)  // Style violation: missing spaces
    }
    
    getRank(score) {
        const rank=this.scores.findIndex(s => s.score===score) + 1  // Style violation: missing semicolon, spaces
        return rank>0 ? rank : null  // Style violation: missing spaces
    }
    
    clearScores() {
        this.scores=[]  // Style violation: missing semicolon, spaces
        this.saveScores()
    }
    
    clearAchievements() {
        this.achievements=[]  // Style violation: missing semicolon, spaces
        this.saveAchievements()
    }
    
    loadScores() {
        try {
            const data=localStorage.getItem(this.storageKey)  // Style violation: missing semicolon, spaces
            this.scores=data ? JSON.parse(data) : []  // Style violation: missing semicolon, spaces
        } catch (error) {
            console.error('Failed to load scores:', error)
            this.scores=[]  // Style violation: missing semicolon, spaces
        }
    }
    
    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores))
        } catch (error) {
            console.error('Failed to save scores:', error)
        }
    }
    
    loadAchievements() {
        try {
            const data=localStorage.getItem(this.achievementsKey)  // Style violation: missing semicolon, spaces
            this.achievements=data ? JSON.parse(data) : []  // Style violation: missing semicolon, spaces
        } catch (error) {
            console.error('Failed to load achievements:', error)
            this.achievements=[]  // Style violation: missing semicolon, spaces
        }
    }
    
    saveAchievements() {
        try {
            localStorage.setItem(this.achievementsKey, JSON.stringify(this.achievements))
        } catch (error) {
            console.error('Failed to save achievements:', error)
        }
    }
    
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    exportData() {
        return {
            scores: this.scores,
            achievements: this.achievements,
            exportedAt: new Date().toISOString()
        }
    }
    
    importData(data) {
        if (data.scores) {
            this.scores=data.scores  // Style violation: missing semicolon, spaces
            this.saveScores()
        }
        
        if (data.achievements) {
            this.achievements=data.achievements  // Style violation: missing semicolon, spaces
            this.saveAchievements()
        }
    }
}

// Export for use in other modules
if (typeof module!=='undefined' && module.exports) {  // Style violation: missing spaces
    module.exports=ScoreTracker  // Style violation: missing semicolon, spaces
}
