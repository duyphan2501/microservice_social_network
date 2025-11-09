import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
} from "lucide-react";

// Component: ThreadPost
const ThreadPost = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <article className="border-b border-gray-200 px-4 py-4 hover:bg-gray-50 transition">
      <div className="flex gap-3">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 relative">
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">+</span>
            </div>
          </div>
          {post.hasThread && (
            <div className="w-0.5 bg-gray-200 flex-grow my-2 min-h-[40px]" />
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px]">{post.username}</span>
              <span className="text-gray-500 text-sm">{post.time}</span>
            </div>
            <button className="p-1 hover:bg-gray-200 rounded-lg">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-[15px] mb-3 whitespace-pre-line">{post.content}</p>

          {post.clip && (
            <div className="text-sm text-gray-600 mb-2">
              ClipD: Anh 96 <span className="text-blue-500">Translate</span>
            </div>
          )}

          {post.image && (
            <div className="mb-3 rounded-2xl overflow-hidden">
              <img
                src={post.image}
                alt="Post content"
                className="w-full object-cover max-h-[500px]"
              />
            </div>
          )}

          <div className="flex items-center gap-5 mt-3">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 hover:opacity-70 transition group"
            >
              <Heart
                className={`w-5 h-5 ${
                  liked ? "fill-red-500 text-red-500" : "text-gray-700"
                } group-hover:scale-110 transition-transform`}
              />
              {likeCount > 0 && (
                <span className="text-gray-600 text-sm">{likeCount}</span>
              )}
            </button>

            <button className="flex items-center gap-2 hover:opacity-70 transition group">
              <MessageCircle className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
              {post.comments > 0 && (
                <span className="text-gray-600 text-sm">{post.comments}</span>
              )}
            </button>

            <button className="flex items-center gap-2 hover:opacity-70 transition group">
              <Repeat2 className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
              {post.reposts > 0 && (
                <span className="text-gray-600 text-sm">{post.reposts}</span>
              )}
            </button>

            <button className="flex items-center gap-2 hover:opacity-70 transition group">
              <Send className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
              {post.shares > 0 && (
                <span className="text-gray-600 text-sm">{post.shares}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};



export default ThreadPost;
