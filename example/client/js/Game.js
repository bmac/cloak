/* global Crafty,_,console,game,player,cloak */

window.game = (function() {
  return {
    _groupIdCounter: 0,
    config: {},

    begin: function() {
      Crafty.init(game.config.gameWidth, game.config.gameHeight, document.getElementById('game'));
      Crafty.background('#ddd');
      
      game.turn = '';

      // Place our home target
      game.targets = [];
      game.placeHomeTarget();

      // Place our draw spot
      game.drawCard = Crafty.e('CardDrawn');
      game.drawCard.attr({
        x: game.config.cardBuffer,
        y: game.config.cardBuffer
      });

      // generate deck (move to server)
      game.deck = [];
      //var nums = ['&#x25b2;', '1', '2', '3', '4', '5', '6', '7', '8', '9', '&#x25cf;', '&#x25cf;', '&#x25cf;', '&#x25cf;'];
      var nums = ['7'];
      _.each(nums, function(num) {
        game.deck.push({ suit: 'black', val: num });
        game.deck.push({ suit: 'black', val: num });
        game.deck.push({ suit: 'red', val: num });
        game.deck.push({ suit: 'red', val: num });
      });

      game.groups = {};
      game.groups.sum = {};
      game.groups.count = {};
      game.cards = [];
    },

    draw: function() {
      cloak.message('requestCard');
      //return game.deck[Math.floor(Math.random()*game.deck.length)];
    },

    newGroupId: function() {
      return this._groupIdCounter++;
    },

    updateGroups: function() {
      game.groups.sum = {};
      game.groups.count = {};
      _.each(game.cards, function(card) {
        if (game.groups.count.hasOwnProperty(card.group)) {
          game.groups.count[card.group] += 1;
        }
        else {
          game.groups.count[card.group] = 1;
        }
        if (game.groups.sum.hasOwnProperty(card.group)) {
          game.groups.sum[card.group] += card.getPoints();
        }
        else {
          game.groups.sum[card.group] = card.getPoints();
        }
      }.bind(this));
    },

    removeAndScore: function() {
      var groupsToRemove = [];
      _.each(game.groups.sum, function(val, key) {
        if (val === 21) {
          groupsToRemove.push(+key);
        }
      });
      _.each(game.cards, function(card) {
        if (_.contains(groupsToRemove, card.group)) {
          card.destroy();
          game.cards = _.reject(game.cards, function(thisCard) { return _.isEqual(thisCard, card); });
        }
      });
      // Weirdly, this triggers "too soon" sometimes so I put in this timeout
      setTimeout(game.refreshTargets, 0);
      game.updateGroups();
    },

    refreshTargets: function() {
      Crafty('Target').each(function() {
        this.refresh();
      });
      // if we have no targets at all left, place a target in the middle.
      if (_.isEmpty(game.groups.sum)) {
        setTimeout(game.placeHomeTarget(),0);
      }
    },

    placeHomeTarget: function() {
      var home = Crafty.e('Target');
      home.attr({
        x: game.config.gameWidth/2 - home.w,
        y: game.config.gameHeight/2 - home.h
      });
    }
  };
})();