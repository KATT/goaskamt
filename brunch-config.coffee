exports.config =
  # See http://brunch.readthedocs.org/en/latest/config.html for documentation.
  plugins:
    stylus:
      paths: [
        './app/assets/images',
      ]
      # imports: ['jeet']
      # jeet: true
    autoReload:
      delay: 500

    stylus:
      paths: [
        './app/assets/img',
      ]
    uglify:
      compress:
        drop_console: true

  # See http://brunch.io/#documentation for docs.
  files:
    javascripts:
      joinTo: 'js/app.js'
    templates:
      joinTo: 'js/app.js'

    stylesheets:
      joinTo: 'css/style.css'
