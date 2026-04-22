import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Calendar, ArrowLeft } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getPostBySlug, formatDate } from "../lib/blog";

const BRAND_BLUE = "#031834";
const SITE_URL = "https://visitalo.es";

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>{`${post.title} | Visítalo.es`}</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.keywords || ""} />
        <meta name="author" content={post.author} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={post.metaDescription || post.excerpt}
        />
        <meta property="og:url" content={url} />
        {post.coverImage && (
          <meta property="og:image" content={`${SITE_URL}${post.coverImage}`} />
        )}
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.metaDescription || post.excerpt,
            datePublished: post.date,
            author: { "@type": "Organization", name: post.author },
            publisher: {
              "@type": "Organization",
              name: "Visítalo.es",
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/visitalo-logo.png`,
              },
            },
            mainEntityOfPage: url,
            image: post.coverImage ? `${SITE_URL}${post.coverImage}` : undefined,
          })}
        </script>
      </Helmet>

      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-10 lg:px-20 py-12 w-full">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
          data-testid="blog-post-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al blog
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Calendar className="w-3 h-3" />
              {formatDate(post.date)} · {post.author}
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
            >
              {post.title}
            </h1>
            <p className="text-lg text-gray-600">{post.excerpt}</p>
          </header>

          {post.coverImage && (
            <div className="aspect-[16/9] bg-gray-50 rounded-xl overflow-hidden mb-8 flex items-center justify-center">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-contain p-12"
              />
            </div>
          )}

          <div className="blog-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
