Ext.define('MainHub.mixins.grid.Resize', {
  resize: function (el) {
    el.setHeight(Ext.Element.getViewportHeight() - 64);
  }
});
