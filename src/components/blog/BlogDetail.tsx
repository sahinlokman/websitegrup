import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Calendar, User, Clock, Eye, Tag, ArrowLeft, Share2, Heart } from 'lucide-react';
import { BlogPost } from '../../types/blog';

interface BlogDetailProps {
  posts: BlogPost[];
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ posts }) => {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find(p => p.slug === slug && p.status === 'published');

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Teknoloji': 'from-blue-500 to-cyan-500',
      'Finans': 'from-green-500 to-emerald-500',
      'Sanat': 'from-pink-500 to-rose-500',
      'İş': 'from-orange-500 to-amber-500',
      'Oyun': 'from-violet-500 to-purple-500',
      'Müzik': 'from-red-500 to-pink-500',
      'Eğitim': 'from-indigo-500 to-blue-500',
      'Genel': 'from-gray-500 to-slate-500'
    };
    return colors[category] || 'from-purple-500 to-pink-500';
  };

  const relatedPosts = posts
    .filter(p => p.id !== post.id && p.status === 'published' && p.category === post.category)
    .slice(0, 3);

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/blog"
              className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-purple-600 transition-colors">Ana Sayfa</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-purple-600 transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{post.title}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            <button
              onClick={sharePost}
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Paylaş</span>
            </button>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} dakika okuma</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{post.views} görüntüleme</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: post.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/^- (.*$)/gm, '<li>$1</li>')
                .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>')
            }}
          />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiketler</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Info */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{post.author}</h4>
              <p className="text-gray-600">Blog yazarı</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">İlgili Yazılar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden"
                >
                  {relatedPost.featuredImage ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className={`aspect-video bg-gradient-to-br ${getCategoryColor(relatedPost.category)} flex items-center justify-center`}>
                      <h4 className="text-white text-lg font-bold text-center px-4">
                        {relatedPost.title}
                      </h4>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <div className="flex items-center justify-between text-gray-500 text-sm">
                      <span>{formatDate(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                      <span>{relatedPost.readTime} dk</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};