
export const moderateTextMiddleware = (req, res, next) => {
    // TODO: Implement actual moderation logic (e.g., using an external service or bad words list)
    // For now, just pass through
    next();
};
