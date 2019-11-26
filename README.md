propsopee problems: inside of the ve directory, there is a themes directory that isn't downloaded for some reason. To deal with this, I had to download the repo and paste themes into the correct directory. Dumb.

- Add new images to folder? `npm run updateGalleries`. This will add images into rows into the html files at the bottom of the page.
- Want to publish? Make sure to `npm run updateGalleries` if needed, `npm run build`, and `npm run publish`. Publishing renames the build folder to docs, pushes to github, and renames it back.
- Need to convert a pdf full of images into a sequence of jpgs? `pdfimages -j pdf.pdf imageName` and it'll create imageName-000.jpg and imageName-001.jpg etc.
