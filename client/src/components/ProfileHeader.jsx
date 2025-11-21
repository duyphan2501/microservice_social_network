
const ProfileHeader = ({ profile, onEditClick }) => {
  return (
    <div className="bg-white rounded-t-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left side - Profile Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {profile?.avatar_url == null ? (
              <div className="w-20 relative flex justify-center items-center h-20 md:w-24 md:h-24 overflow-hidden rounded-full bg-gray-300 to-pink-500 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="100px"
                  viewBox="0 -960 960 960"
                  width="100px"
                  fill="#797979ff"
                  className="absolute top-3"
                >
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z" />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0">
                <img
                  src={profile.avatar_url}
                  alt="avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-1 break-words">
                {profile?.full_name}
              </h1>
              <p className="text-gray-600 mb-3">@{profile?.username}</p>
              {profile?.bio && (
                <p className="text-sm md:text-base text-gray-700 mb-3 whitespace-pre-line">
                  {profile.bio}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  <span className="font-semibold text-black">
                    {profile?.friends}
                  </span>{" "}
                  friends
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Social Links */}
        <div className="flex items-center gap-3 justify-center md:justify-start">
          {profile?.socialLinks?.instagram && (
            <a
              href={profile?.socialLinks?.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {profile?.socialLinks?.website && (
            <a
              href={profile?.socialLinks?.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <button
        onClick={onEditClick}
        className="w-full mt-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
      >
        Edit profile
      </button>
    </div>
  );
};

export default ProfileHeader;
