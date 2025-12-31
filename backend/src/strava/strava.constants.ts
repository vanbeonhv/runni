/**
 * Strava module constants
 */
export const STRAVA_CONSTANTS = {
  /**
   * Number of most recent activities to fetch during initial user onboarding
   * Configurable - modify this value to change fetch count
   */
  INITIAL_ACTIVITY_SYNC_COUNT: 10,

  /**
   * Default number of days to look back when syncing recent activities
   */
  DEFAULT_SYNC_DAYS: 7,

  /**
   * Maximum activities to fetch per page from Strava API
   */
  MAX_ACTIVITIES_PER_PAGE: 200,
} as const;
