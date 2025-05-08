function calculateProviderRank(user) {
    const { averageRating, completedTasks, recommendations } = user;
  
    if (averageRating >= 4.8 && completedTasks >= 30 && recommendations >= 25) {
      return 'Platinum';
    }
    if (averageRating >= 4.5 && completedTasks >= 15 && recommendations >= 10) {
      return 'Gold';
    }
    if (averageRating >= 4.0 && completedTasks >= 5 && recommendations >= 3) {
      return 'Silver';
    }
    if (averageRating >= 3.5 && completedTasks >= 1) {
      return 'Bronze';
    }
    return 'Bronze';
  }
  
  module.exports = { calculateProviderRank };