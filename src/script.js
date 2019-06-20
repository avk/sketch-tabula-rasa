import sketch from 'sketch'
const Settings = require('sketch/settings')

const doc = sketch.getSelectedDocument()

// TODO make configurable via plugin settings
let blank_bg = {
  enabled: true,
  includedInExport: true,
  color: "#ffffffff"
}

// HELPERS

function eachArtboard(callback) {
  doc.pages.forEach(page => {
    // NOTE: all artboards are layers
    page.layers.forEach(layer => {
      if (layer.type === "Artboard") {
        callback(layer)
      }
    })
  })
}

function countLayers(doc) {
  return doc.pages.find(page => page.selected).layers.length
}

// COMMANDS

export function AddAll() {
  let change_count = 0
  eachArtboard(artboard => {
    artboard.background = {...blank_bg}
    change_count++
  })
  if (change_count > 0) {
    sketch.UI.message(`Added blank backgrounds to all ${change_count} artboards.`)
  } else {
    sketch.UI.message("No artboards to update.")
  }
}

export function AddTransparent() {
  let change_count = 0
  eachArtboard(artboard => {
    if (artboard.background.enabled === false) {
      // console.log("Artboard has disabled bg: " + artboard.name)
      artboard.background = {...blank_bg}
      change_count++
    }
  })
  if (change_count > 0) {
    sketch.UI.message(`Added blank backgrounds to ${change_count} transparent artboards.`)
  } else {
    sketch.UI.message("No artboards to update.")
  }
}

export function RemoveAll() {
  let change_count = 0
  eachArtboard(artboard => {
    if (artboard.background.enabled && 
      artboard.background.color === blank_bg.color) {
      // console.log("Artboard has blank bg: " + artboard.name)
      artboard.background.enabled = false
      change_count++
    }
  })
  if (change_count > 0) {
    sketch.UI.message(`Reset ${change_count} blank backgrounds to transparent.`)
  } else {
    sketch.UI.message("No artboards to update.")
  }
}

// ACTIONS

export function onInsertArtboard(context) {
  // counter to distinguish artboard insertion from artboard selection
  Settings.setSessionVariable(
    "layersBeforeInsert", 
    countLayers(sketch.getSelectedDocument())
  )
}

export function onNewArtboard(context) {
  let newArtboard = sketch.fromNative(context.actionContext.newArtboard)
  
  // this action also called when artboards selected; let's ignore that case
  let layersBefore = Settings.sessionVariable("layersBeforeInsert")
  let layersNow = countLayers(sketch.getSelectedDocument())
  // console.log(`layersBefore ${layersBefore}`);
  // console.log(`layersNow ${layersNow}`);
  let insertStarted = typeof layersBefore !== "undefined"
  let artboardAdded = (layersNow > layersBefore)

  // this action also called when artboards removed; let's ignore that case
  let artboardExists = typeof newArtboard !== "undefined"

  if (artboardExists && insertStarted && artboardAdded) {
    // console.log("added newArtboard called " + newArtboard.name)
    newArtboard.background = {...blank_bg} // shallow clone
  }

  // reset session for future artboard changes
  Settings.setSessionVariable(
    "layersBeforeInsert", 
    undefined
  )
}
