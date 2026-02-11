// Application constants

const VENUE_TYPES = [
  "restaurant", "cafe", "bar", "club", "gym",
  "park", "library", "mall", "coworking", "event", "other"
];

const USER_STATUSES = ["Active", "Suspended", "Banned"];

const REPORT_STATUSES = ["Open", "Reviewed", "Closed"];

const MATCH_TYPES = ["swipe", "nearby", "event", "admin"];

const GENDERS = ["male", "female", "non-binary", "other"];

const INTEREST_OPTIONS = ["everyone", "male", "female"];

const PRESENCE_TTL_HOURS = 4;

const EPHEMERAL_MATCH_TTL_HOURS = 24;

const MAX_PHOTOS = 6;

const MAX_BIO_LENGTH = 500;

const MIN_AGE = 18;

const DEFAULT_VENUE_RADIUS_METERS = 100;

module.exports = {
  VENUE_TYPES,
  USER_STATUSES,
  REPORT_STATUSES,
  MATCH_TYPES,
  GENDERS,
  INTEREST_OPTIONS,
  PRESENCE_TTL_HOURS,
  EPHEMERAL_MATCH_TTL_HOURS,
  MAX_PHOTOS,
  MAX_BIO_LENGTH,
  MIN_AGE,
  DEFAULT_VENUE_RADIUS_METERS
};
