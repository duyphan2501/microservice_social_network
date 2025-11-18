import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Heart, ArrowLeft, MoreHorizontal } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Comment from "../components/Comment";
import usePostStore from "../stores/usePostStore";
import useUserStore from "../stores/useUserStore";
import { formatRelativeTime } from "../utils/DateFormat";
import useCommentStore from "../stores/useCommentStore";
import PostMedia from "../components/PostMedia";
import useSocketStore from "../stores/useSocketStore";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import { MyContext } from "../Context/MyContext";

const CommentPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  useEffect(() => {
    if (!postId) navigate("/");
  }, [postId, navigate]);

  const { isLoading, getPost, saveLike } = usePostStore();
  const { fetchUserIfNeeded } = useUserStore();
  const { getPostComments, addComment } = useCommentStore();
  const user = useUserStore((state) => state.user);
  const { setIsShowLoginNavigator } = useContext(MyContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentText, setCommentText] = useState("");

  const [visibleCount, setVisibleCount] = useState(5);
  const loadMoreRef = useRef(null);

  const { mainSocket } = useSocketStore();
  const axiosPrivate = useAxiosPrivate();

  const updatePostLikes = (data) => {
    setLikeCount(data.likes_count);
  };

  const receiveNewComment = (comment) => {
    if (postId.toString() === comment.post_id.toString()) {
      if (comment.user_id === user?.id) {
        return;
      }
      setComments((prev) => [...prev, comment]);
      setCommentCount((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (mainSocket && postId) {
      mainSocket.emit("join_postRoom", postId);
      mainSocket?.on("update_post_likes", updatePostLikes);
      mainSocket?.on("receive_new_comment", receiveNewComment);
    }

    return () => {
      mainSocket?.off("update_post_likes", updatePostLikes);
      mainSocket?.off("receive_new_comment", receiveNewComment);
      if (mainSocket && postId) {
        mainSocket.emit("leave_postRoom", postId);
      }
    };
  }, [postId, mainSocket]);

  const handleLike = useCallback(async () => {
    if (!user) {
      setIsShowLoginNavigator(true);
      return;
    }
    const res = await saveLike(postId, axiosPrivate);
    setLiked(res.liked || false);
  }, [liked]);

  const fetchPostData = useCallback(async () => {
    try {
      const [resPost, resComments] = await Promise.all([
        getPost(postId),
        getPostComments(postId),
      ]);

      const author = await fetchUserIfNeeded(resPost.user_id);
      const finalPost = { ...resPost, author };
      setComments(resComments);
      setPost(finalPost);
      setLikeCount(finalPost.likes_count);
      setCommentCount(finalPost.comments_count);
      setLiked(resPost.isLiked || false);
    } catch (error) {
      console.error("Failed to fetch post data:", error);
    }
  }, [postId, getPost, getPostComments, fetchUserIfNeeded]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  const handleReply = useCallback(
    (commentId) => {
      if (!user) {
        setIsShowLoginNavigator(true);
        return;
      }
      if (replyingTo !== commentId) {
        setReplyingTo(commentId);
      }
    },
    [replyingTo]
  );

  // Helper function moved outside the component body or into a util file
  const buildCommentTree = (commentsArr) => {
    if (!commentsArr) return [];
    const commentMap = {};
    const rootComments = [];

    commentsArr.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    commentsArr.forEach((comment) => {
      if (comment.parent_comment_id === null) {
        rootComments.push(commentMap[comment.id]);
      } else if (commentMap[comment.parent_comment_id]) {
        commentMap[comment.parent_comment_id].replies.push(
          commentMap[comment.id]
        );
      }
    });
    return rootComments;
  };

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
  const level0Comments = useMemo(
    () => commentTree.slice(0, visibleCount),
    [commentTree, visibleCount]
  );

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const option = {
      root: null,
      rootMargin: "0px",
      threshold: 0.9,
    };
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setVisibleCount((prev) => {
          const next = prev + 10;
          // Nếu hết comment thì ngừng tăng
          return next > commentTree.length ? commentTree.length : next;
        });
      }
    }, option);

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [commentTree]);

  const handleSubmitComment = async (content) => {
    if (!content.trim() || !post) return;

    // In a real app, this data would go to an API via the store
    const tempCommentId = `temp_${Date.now()}`;
    const newCommentData = {
      id: tempCommentId,
      user_id: user?.id,
      created_at: new Date().toISOString(),
      post_id: post.id,
      parent_comment_id: replyingTo || null,
      content: content,
    };
    // update UI immediately
    setComments((prev) => [...prev, newCommentData]);
    setCommentCount((prev) => prev + 1);

    try {
      const addedCommentFromServer = await addComment(
        newCommentData.post_id,
        newCommentData.parent_comment_id,
        newCommentData.content,
        axiosPrivate
      );
      setComments((prev) =>
        prev.map((c) => (c.id === tempCommentId ? addedCommentFromServer : c))
      );
      setCommentText("");
      setReplyingTo(null);
    } catch (error) {
      setComments((prev) => prev.filter((c) => c.id !== tempCommentId));
      setCommentCount((prev) => prev - 1);
      console.error(error);
      toast.error("Failed to submit comment:", error);
    }
  };

  if (isLoading || !post) return <div>Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-4">
        {/* Inline Header */}
        <div className="bg-white rounded-t-2xl border border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-grow">
            <h1 className="font-semibold text-base">Thread</h1>
            <p className="text-gray-500 text-xs">5.5K views</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full -mr-2">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Original Post - no tree line */}
        <div className="bg-white border-x border-gray-200 px-4 py-4 border-b ">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0 overflow-hidden">
              <img
                src={post.author.avatar_url}
                alt=""
                className="size-full object-cover"
              />
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px]">
                    {post?.author?.username}
                  </span>
                  <span className="text-gray-500 text-xs">
                    &bull; {formatRelativeTime(post?.created_at)}
                  </span>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[15px] mb-3 whitespace-pre-line">
                {post.content}
              </p>
              <div className="">
                <PostMedia media={post.media} />
              </div>
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

                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-sm">{commentCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white border-x border-gray-200 px-4 pb-4 max-h-[500px] overflow-auto">
          <div className="space-y-6 pt-4">
            {level0Comments.map((comment, index) => (
              <Comment
                key={comment.id}
                comment={comment}
                level={0}
                onReply={handleReply}
                showReplyInput={replyingTo}
                isLast={index === level0Comments.length - 1}
                hasMoreSiblings={index < level0Comments.length - 1}
                onSubmit={handleSubmitComment}
              />
            ))}
          </div>
          {visibleCount < commentTree.length && (
            <div
              ref={loadMoreRef}
              className="h-8 flex justify-center items-center text-gray-400 text-sm"
            >
              Đang tải thêm...
            </div>
          )}
        </div>

        {/* Comment Input - Separate rounded box at bottom */}
        <div className="bg-white rounded-b-2xl border border-gray-200 px-4 py-3 mb-4">
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
              <img
                src={user?.avatar_url}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <input
              type="text"
              value={commentText}
              disabled={!user}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-grow bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) =>
                e.key === "Enter" && handleSubmitComment(commentText)
              }
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              className={`transition ${
                commentText.trim()
                  ? "text-blue-500 hover:text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentPage;
