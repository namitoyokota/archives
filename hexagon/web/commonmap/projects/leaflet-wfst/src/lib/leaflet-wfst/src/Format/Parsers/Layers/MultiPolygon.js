/**
 * Created by PRadostev on 09.06.2015.
 */

L.GML.MultiPolygon = L.GML.AbstractMultiPolygon.extend({
  initialize: function () {
    L.GML.AbstractMultiPolygon.prototype.initialize.call(this);
    this.elementTag = 'gml:MultiPolygon';
  }
});
