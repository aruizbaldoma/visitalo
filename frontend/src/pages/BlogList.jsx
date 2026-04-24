import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getAllPosts, formatDate } from "../lib/blog";

const BRAND_BLUE = "#031834";

export default function BlogList() {
  const { t } = useTranslation();
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>{t("blog.title")}</title>
        <meta
          name="description"
          content={t("blog.subtitle")}
        />
        <meta property="og:title" content={t("blog.title")} />
        <meta
          property="og:description"
          content={t("blog.subtitle")}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://visitalo.es/blog" />
        <link rel="canonical" href="https://visitalo.es/blog" />
      </Helmet>

      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-10 lg:px-20 py-12 md:py-16 w-full">
        <div className="mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 font-heading"
            style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
          >
            {t("blog.heading")}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl">
            {t("blog.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              data-testid={`blog-card-${post.slug}`}
            >
              <Link to={`/blog/${post.slug}`} className="block">
                {post.coverImage && (
                  <div className="aspect-[16/9] bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.date)} · {post.author}
                  </div>
                  <h2
                    className="text-xl font-bold mb-2 font-heading group-hover:opacity-80 transition-opacity"
                    style={{ color: BRAND_BLUE }}
                  >
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">{post.excerpt}</p>
                  <span
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: BRAND_BLUE }}
                  >
                    {t("blog.readMore")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
