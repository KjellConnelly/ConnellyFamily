const recursive = require("recursive-readdir")
const path = require('path')
const yaml = require('js-yaml')
const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const ignoreDirectories = ['node_modules','ve','.git','build','Unprocessed']
const singleImageTypes = ['full-picture','bordered-picture','panorama','author']
const directoriesToCheckSize = ['build','Childhood','MomAndDaTogetherEarly','TeenageYears','YoungAdulthood',]

function start() {
  recursive("./", ignoreDirectories, (err, files)=>{
    let yamlPaths = []
    for (let i = 0; i < files.length; i++) {
      const ext = path.extname(path.basename(files[i]))
      if (ext == '.yaml') {
        yamlPaths.push(files[i])
      }
    }

    for (let i = 0; i < yamlPaths.length; i++) {
      const directoryPath = path.dirname(yamlPaths[i])
      const allFiles = fs.readdirSync(directoryPath)
      const allImages = allFiles.filter(file=>{
        const ext = path.extname(file)
        return ((ext == '.png') || (ext == '.jpg') || (ext == '.jpeg'))
      })


      try {
        let imagesAlreadyAdded = []
        let doc = yaml.safeLoad(fs.readFileSync(yamlPaths[i], 'utf8'))
        if (doc.sections != undefined) {
          doc.sections.forEach((section, i)=>{
            if (singleImageTypes.includes(section.type)) {
              !imagesAlreadyAdded.includes(section.image) && imagesAlreadyAdded.push(section.image)
            } else if (section.type == 'pictures-group') {
              section.images.forEach(row=>{
                row.forEach(img=>{
                  !imagesAlreadyAdded.includes(img) && imagesAlreadyAdded.push(img)
                })
              })
            }
          })
        }

        let imagesNotAdded = allImages.filter(img=>!imagesAlreadyAdded.includes(img))

        if (imagesNotAdded.length > 0) {
          if (doc.sections == undefined) {
            doc.sections = []
          }

          if (imagesNotAdded.length == 1) {
            imagesNotAdded.forEach(img=>{
              doc.sections.push({
                type:"bordered-picture",
                image:img
              })
            })
          } else {
            imagesNotAdded = imagesNotAdded.reduce((rows, key, index) => (index % 3 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, [])
            doc.sections.push({
              type:"pictures-group",
              images:imagesNotAdded
            })
          }
          //console.log(imagesNotAdded)

          /* This adds bordered pictures
          imagesNotAdded.forEach(img=>{
            doc.sections.push({
              type:"bordered-picture",
              image:img
            })
          })
          */

          fs.writeFile(yamlPaths[i], yaml.safeDump(doc), (err) => {
            if (err) {console.log(`updateGalleries error writing update yaml: ${err}`)}
          })
        }
      } catch (e) {
        console.log(`yaml-js error: ${e}`)
      }

    }


  })
}

async function getDirectorySizes() {
  try {
    for (let i = 0; i < directoriesToCheckSize.length; i++) {
      const {stdout, stderr} = await exec(`du -sh ${directoriesToCheckSize[i]}`)
      console.log(stdout)
    }
  } catch(err) {
    console.log(`updateGalleries.js getDirectorySizes() error: ${err}`)
  }
}

start()
getDirectorySizes()
