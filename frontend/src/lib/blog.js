import postsData from "../content/blog/posts.json";

export const getAllPosts = () =>
  [...postsData.posts].sort((a, b) => (a.date < b.date ? 1 : -1));

export const getPostBySlug = (slug) =>
  postsData.posts.find((p) => p.slug === slug) || null;

export const formatDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
