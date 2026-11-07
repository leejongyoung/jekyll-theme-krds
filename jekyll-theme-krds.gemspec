# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "jekyll-theme-krds"
  spec.version       = "1.4.6"
  spec.authors       = ["Lee Jongyoung"]
  spec.summary       = "Jekyll theme based on KRDS (Korea Design System)"
  spec.description   = "A general-purpose Jekyll theme built on the Korean government design system (KRDS)."
  spec.homepage      = "https://github.com/leejongyoung/jekyll-theme-krds"
  spec.license       = "MIT"

  spec.metadata["plugin_type"] = "theme"

  spec.files = Dir["{_layouts,_includes,_sass,assets}/**/*", "LICENSE", "NOTICE.md", "README.md"]
  spec.required_ruby_version = ">= 3.1"

  spec.add_runtime_dependency "jekyll", ">= 4.3", "< 5.0"
  spec.add_runtime_dependency "jekyll-seo-tag", "~> 2.8"
end
