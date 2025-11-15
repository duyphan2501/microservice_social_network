const filterFieldUser = (user) => {
  if (!user) return {};
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    bio: user.bio,
    last_active_at: user.last_active_at,
    is_verified: user.is_verified,
  };
};

export { filterFieldUser };
