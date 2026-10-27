# Dependencies for building the site locally and in GitHub Actions.
# Install with:  bundle install
source "https://rubygems.org"

gem "jekyll", "~> 4.3"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"     # /feed.xml (RSS/Atom for the blog)
  gem "jekyll-seo-tag", "~> 2.8"   # <title>, description, canonical, Open Graph
  gem "jekyll-sitemap", "~> 1.4"   # /sitemap.xml
end

# Ruby 3.4+ no longer bundles these as default gems.
gem "csv"
gem "base64"
gem "bigdecimal"
gem "logger"

# Faster file watching on Windows / JRuby (harmless elsewhere).
gem "wdm", "~> 0.1", platforms: [:windows]
gem "tzinfo-data", platforms: [:windows, :jruby]
