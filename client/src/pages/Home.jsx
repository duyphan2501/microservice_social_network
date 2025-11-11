import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ThreadPost from "../Components/ThreadPost";
import NewThreadModal from "../Components/NewThreadModal";

// Main Component
const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: "duy",
      time: "3h",
      content: "đế vương phải có long ngai!",
      media: [
        {
          url: "https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/578266243_846771654960260_4697044188393644855_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=aa7b47&_nc_eui2=AeGNPuq7uts0rWdNU8ch_pMmNxOPbnVOGIU3E49udU4YhfabT90M516KqwHUc83Pu_Jmcg2SsxThkLgBCAw6LpOM&_nc_ohc=cRPUaR6qsKYQ7kNvwFBnJ-b&_nc_oc=Adlt5FX1A0I0wm3FnfMGuZ8YbSKO9pZMlwZd16Zpq4tgVPlYQgMvdLuUNzBCROzMhrg&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=vifG91P9yYnrVvjuod11_w&oh=00_AfgV96CzLO2AM4Pf3ZAy0JSpKT1WvVOUG1s_ese27ke_pw&oe=6916A766",
          type: "image",
        },
      ],
      likes: 60,
      comments: 2,
      reposts: 4,
      shares: 0,
    },
    {
      id: 2,
      username: "duy",
      time: "10h",
      content: "gà",
      media: [
        {
          url: "https://scontent-hkg4-1.xx.fbcdn.net/v/t39.30808-6/577589201_2636352886722699_2463702600817763023_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=aa7b47&_nc_eui2=AeHZsFBQ7gD5W20exarSqltnTSrhEpciusVNKuESlyK6xYvHCWMou-GpSzzDa4IFJImPJmklU5r2bSSq1Lyyu5Dt&_nc_ohc=NCnnRsn4DW8Q7kNvwFer0OQ&_nc_oc=AdmUi3AL4Nyo4ZmztKcrwFIYpmdosScuHCw7dCiSfUvKoR-TKwX7hkyo-It8kc90huleImxkWcXmQxx4r23jVrBB&_nc_zt=23&_nc_ht=scontent-hkg4-1.xx&_nc_gid=N7AvmLWv0d_QiHpSIztKmw&oh=00_AfirYzt-5YPHaiL39nyHa856DSHJv3zh2PCrwCcloB0fpQ&oe=69166105",
          type: "image",
        },
      ],
      likes: 450,
      comments: 4,
      reposts: 2,
      shares: 2,
    },
    {
      id: 3,
      username: "meomaybe",
      time: "2h",
      content: "Mẹ mày béo vcl, t xài 2 tấm hình còn chưa đủ",
      media: [
        {
          url: "https://files.catbox.moe/pv2fm6.png",
          type: "image",
        },
        {
          url: "https://files.catbox.moe/hfhbro.png",
          type: "image",
        },
      ],
      likes: 447,
      comments: 2,
      reposts: 37,
      shares: 4,
    },
  ]);

  const handleNewPost = (newPost) => {
    const post = {
      id: posts.length + 1,
      username: "You",
      time: "Just now",
      content: newPost.content,
      media: newPost.media,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
    };
    setPosts([post, ...posts]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-4">
        {/* New Post Button */}
        <div className="bg-white rounded-2xl border border-gray-200 px-4 py-4 mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-grow text-left text-gray-400 text-[15px] py-2"
            >
              What's new?
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
              <ThreadPost post={post} />
            </div>
          ))}
        </div>
      </div>

      <NewThreadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPost={handleNewPost}
      />
    </div>
  );
};

export default Home;
