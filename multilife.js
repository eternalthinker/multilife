/*
 * Javascript implementation of Conway's Game of Life and other cellular automata
 * Extended to include
 *
 * Author: Rahul Anand [ eternalthinker.co ], Dec 2014
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
*/

$(document).ready(function() {

    /* ================== MultiLife class ================ */
    function Cell () {
        this.age = 0; // Determines generation color
        this.alive = false;
        this.color = -1;
    }
    
    function MultiLife (rows, cols, rule, nColors) {
        if (rule) {
            this.B = rule.B; // B(orn)
            this.S = rule.S; // S(tay alive)
        } else {
            this.B = [3]; // B(orn)
            this.S = [2, 3]; // S(tay alive)
        }
        this.rows = rows;
        this.cols = cols;
        this.nColors = nColors;

        this.world = [];
        this.world2 = [];
        this.generation = 0;
        this.population = [];
        for (var i = 0; i < this.nColors; ++i) {
            this.population[i] = 0;
        }
        this.population_t = 0;

        // Actions
        this.init();
    }

    MultiLife.prototype.init = function () {
        // Initialize world cells
        for (var x = 0; x < this.cols; ++x) {
            this.world[x] = [];
            this.world2[x] = [];
            for (var y = 0; y < this.rows; ++y) {
                this.world[x][y] = new Cell();
                this.world2[x][y] = new Cell();
            }
        }
    }

    MultiLife.prototype.get = function (x, y) {
        return this.world[x][y];
    }

    MultiLife.prototype.set = function (x, y, color) {
        this.world[x][y].alive = true;
        this.world[x][y].age = 1;
        this.world[x][y].color = color;
    }

    MultiLife.prototype.unset = function (x, y) {
        this.world[x][y].alive = false;
        this.world[x][y].age = -1;
        this.world[x][y].color = -1;
    }

    MultiLife.prototype.setRule = function (rule) {
        this.B = rule.B;
        this.S = rule.S;
    }

    MultiLife.prototype.clear = function () {
        for (var x = 0; x < this.cols; ++x) {
            for (var y = 0; y < this.rows; ++y) {
                this.world[x][y].alive = false;
                this.world[x][y].age = 0;
                this.world[x][y].color = -1;
            }
        }
        this.generation = 0;
    }

    MultiLife.prototype.randomfill = function() {
        this.generation = 0;
        this.population_t = 0;
        for (var i = 0; i < this.nColors; ++i) {
            this.population[i] = 0;
        }
        for (var x = 0; x < this.cols; ++x) {
            for (var y = 0; y < this.rows; ++y) {
                var alive = Math.floor(Math.random()*4) < 1; // 25% or 1/4 alive
                if (alive) {
                    this.population_t++;
                    this.world[x][y].alive = true;
                    this.world[x][y].age = 1;
                    this.world[x][y].color = Math.floor(Math.random()*this.nColors);
                    this.population[this.world[x][y].color]++;
                } else {
                    this.world[x][y].alive = false;
                    this.world[x][y].age = 0;
                    this.world[x][y].color = -1;
                }
                
            }
        }
    }

    MultiLife.prototype.getNeighbourCount = function (x, y) {
        var ncounts = [];
        for (var i = 0; i < this.nColors; ++i) {
            ncounts[i] = 0;
        }

        // Bounded grid
        /* // Left
        if (this.world[x-1] && this.world[x-1][y].alive) { ++ncount; }
        if (this.world[x-1] && this.world[x-1][y-1] && this.world[x-1][y-1].alive) { ++ncount; }
        if (this.world[x-1] && this.world[x-1][y+1] && this.world[x-1][y+1].alive) { ++ncount; }
        // Adj
        if (this.world[x] && this.world[x][y-1] && this.world[x][y-1].alive) { ++ncount; }
        if (this.world[x] && this.world[x][y+1] && this.world[x][y+1].alive) { ++ncount; }
        // Right
        if (this.world[x+1] && this.world[x+1][y].alive) { ++ncount; }
        if (this.world[x+1] && this.world[x+1][y-1] && this.world[x+1][y-1].alive) { ++ncount; }
        if (this.world[x+1] && this.world[x+1][y+1] && this.world[x+1][y+1].alive) { ++ncount; } */

        // Toroidal grid
        var x1 = (x > 0)? x: this.cols;
        var y1 = (y > 0)? y: this.rows;
        // Left
        if (this.world[x1-1][y].alive) { ++ncounts[this.world[x1-1][y].color]; }
        if (this.world[x1-1][y1-1].alive) { ++ncounts[this.world[x1-1][y1-1].color]; }
        if (this.world[x1-1][(y+1) % this.rows].alive) { ++ncounts[this.world[x1-1][(y+1) % this.rows].color]; }
        // Adj
        if (this.world[x][y1-1].alive) { ++ncounts[this.world[x][y1-1].color]; }
        if (this.world[x][(y+1) % this.rows].alive) { ++ncounts[this.world[x][(y+1) % this.rows].color]; }
        // Right
        if (this.world[(x+1) % this.cols][y].alive) { ++ncounts[this.world[(x+1) % this.cols][y].color]; }
        if (this.world[(x+1) % this.cols][y1-1].alive) { ++ncounts[this.world[(x+1) % this.cols][y1-1].color]; }
        if (this.world[(x+1) % this.cols][(y+1) % this.rows].alive) { ++ncounts[this.world[(x+1) % this.cols][(y+1) % this.rows].color]; }

        return ncounts;
    }

    MultiLife.prototype.step = function () {
        for (var i = 0; i < this.population.length; ++i) {
            this.population[i] = 0;
        }
        this.population_t = 0;
        for (var x = 0; x < this.cols; ++x) {
            for (var y = 0; y < this.rows; ++y) {
                var ncounts = this.getNeighbourCount(x, y);
                if (this.world[x][y].alive) {
                    if (this.S.indexOf( ncounts[this.world[x][y].color] ) != -1) {
                        var color = this.world[x][y].color;
                        this.world2[x][y].alive = true;
                        this.world2[x][y].color = color;
                        this.world2[x][y].age = 1;
                        this.population[color]++;
                        this.population_t++;
                    } else {
                        this.world2[x][y].alive = false;
                        this.world2[x][y].color = -1;
                        this.world2[x][y].age = -1; // Just died
                    }
                }
                else {
                    var max = -1, candidates = [], ntotal = 0;
                    for (var i = 0; i < this.nColors; ++i) {
                        var ncount = ncounts[i];
                        ntotal += ncount;
                        if (this.B.indexOf(ncount) != -1) {
                            if (ncount > max) {
                                candidates = [];
                                max = ncount;
                                candidates.push( {color: i, count: ncount} );
                            }
                            else if (ncount == max) {
                                candidates.push( {color: i, count: ncount} );
                            }
                        }
                    }
                    if (candidates.length > 0) {
                        var r = Math.floor(Math.random() * candidates.length);
                        var color = candidates[r].color;
                        this.world2[x][y].alive = true;
                        this.world2[x][y].color = color;
                        this.world2[x][y].age = 1; // It's alive!
                        this.population[color]++;
                        this.population_t++;
                    } else {
                        this.world2[x][y].alive = false;
                        this.world2[x][y].color = -1;
                        this.world2[x][y].age = this.world[x][y].age;
                    }
                }

            }
        }
        
        // Apply next generation
        var temp = this.world;
        this.world = this.world2;
        this.world2 = temp;
        this.generation++;
    }
    /* ================== End of MultiLife class ================ */


    /* ================== Ui class ================ */
    function Ui (Rules) {
        this.Rules = Rules;

        // Ui components
        this.$run_btn = $('#run');
        this.$step_btn = $('#step');
        this.$pause_btn = $('#pause');
        this.$reset_btn = $('#reset');
        this.$slider_ui = $('#slider');
        this.slider_values = [1000, 250, 120, 70, 10];
        this.$trace_chk = $('#trace-switch');
        this.$grid_chk = $('#grid-switch');
        this.$grid_cnvs = $('#grid');
        this.$world_cnvs = $('#world');
        this.world_cnvs = $('#world').get(0);
        this.$generation_ui = $('#generation');
        this.$population_ui = $('#population');
        this.$rules_sel = $('#rules');
        this.$brule_ip = $('#b-rule');
        this.$srule_ip = $('#s-rule');

        // Ui component handlers
        this.$run_btn.click($.proxy(this.run, this));
        this.$step_btn.click($.proxy(this.step_update, this));
        this.$pause_btn.click($.proxy(this.pause, this)); 
        this.$reset_btn.click($.proxy(this.reset, this));

        if (this.$slider_ui.length > 0) {
          this.$slider_ui.slider({
            min: 1,
            max: 5,
            value: 3,
            orientation: "horizontal",
            range: "min",
            slide: $.proxy(function (event, ui) {
                this.frameDelay = this.slider_values[ui.value - 1];
            }, this)
          }).addSliderSegments(this.$slider_ui.slider("option").max);
        }

        this.$grid_chk.bootstrapSwitch('state', true);
        this.$grid_chk.on('switchChange.bootstrapSwitch', $.proxy(function (event, state) {
          if (state) {
            this.$grid_cnvs.show();
          } else {
            this.$grid_cnvs.hide();
          }
        }, this));

        $('select').select2();
        this.$rules_sel.on('change', $.proxy(function (event) {
            if (event.val !== "CUSTOM") {
                this.setRule(event.val);
            } 
            else {
                var curRule = this.Rules[this.rulename];
                this.rule = { B: curRule.B.slice(0), S: curRule.S.slice(0) };
                this.rulename = event.val;
                this.$brule_ip.prop('disabled', false).parent().addClass('has-success');
                this.$srule_ip.prop('disabled', false).parent().addClass('has-success');
            }
        }, this));

        this.$brule_ip.on('input', $.proxy(function (event) {
            var B = this.parseRule(this.$brule_ip.val());
            if (B) {
                this.rule.B = B;
                this.life.setRule(this.rule);
                this.$brule_ip.parent().removeClass('has-error').addClass('has-success');
            }
            else {
                this.$brule_ip.parent().removeClass('has-success').addClass('has-error');
            }
        }, this));
        this.$srule_ip.on('input', $.proxy(function (event) {
            var S = this.parseRule(this.$srule_ip.val());
            if (S) {
                this.rule.S = S;
                this.life.setRule(this.rule);
                this.$srule_ip.parent().removeClass('has-error').addClass('has-success');
            }
            else {
                this.$srule_ip.parent().removeClass('has-success').addClass('has-error');
            }
        }, this));

        $(window).blur($.proxy(function () {
            this.halt || this.pause();
        }, this));

        // Life appearance variables
        this.w = 750;
        this.h = 600;
        this.cellSize = 5;
        this.cellColor = '#000000';
        this.gridColor = '#CCCCCC';
        this.bgColor = '#FFFFFF';
        //this.CellColors = ['#6C7A89', '#DC3023', '#22A7F0', '#5B8930']; 
        this.CellColors = ['#F22613', '#FFA631', '#26A65B', '#4B77BE'];
        this.gridStroke = 0.5;
        this.frameDelay = 120; // ms
        this.frameTimer;

        this.world_ui = $('#world').get(0).getContext('2d');
        this.grid_ui = $('#grid').get(0).getContext('2d');
        this.world_ui.fillStyle = this.cellColor;
        this.world_ui.strokeStyle  = this.bgColor;
        this.grid_ui.fillStyle = this.bgColor;
        this.grid_ui.strokeStyle = this.gridColor;
        this.grid_ui.lineWidth = this.gridStroke;

        this.rows = this.h / this.cellSize;
        this.cols = this.w / this.cellSize;
        this.rulename = "GAME_OF_LIFE";
        this.rule = { B:[], S:[] };
        this.nColors = 4;
        this.trace = true;
        this.halt = true;

        // Actions
        this.$rules_sel.select2('val', this.rulename);
        this.$brule_ip.prop('disabled', true).parent().removeClass('has-error').removeClass('has-success');
        this.$srule_ip.prop('disabled', true).parent().removeClass('has-error').removeClass('has-success');
        this.$run_btn.prop('disabled', false);
        this.$step_btn.prop('disabled', false);
        this.$pause_btn.prop('disabled', true);
        this.paintGrid();
        this.life = new MultiLife (this.rows, this.cols, null, this.nColors);
        this.setRule (this.rulename);
        this.life.randomfill();
        this.paint();
    }

    Ui.prototype.parseRule = function (value) {
        var rulePat = /^\s*([0-8]{0,9})\s*$/; // full, rulenums
        var ruleMatch = rulePat.exec(value);
        if (! ruleMatch) return null;
        var rule = ruleMatch[1];
        var arr = [];
        for (var i = 0; i < rule.length; ++i) {
            var num = +rule[i];
            if (arr.indexOf(num) != -1) return null;
            arr.push(num);
        }
        return arr;
    }

    Ui.prototype.setRule = function (rulename) {
        var rule = this.Rules[rulename];
        this.life.setRule(rule);
        this.$brule_ip.val(rule.B.join(''));
        this.$srule_ip.val(rule.S.join(''));
        if (this.rulename === "CUSTOM") {
            this.$brule_ip.prop('disabled', true).parent().removeClass('has-error').removeClass('has-success');
            this.$srule_ip.prop('disabled', true).parent().removeClass('has-error').removeClass('has-success');
        }
        this.rulename = rulename;
    }

    Ui.prototype.run = function () {
        this.update();
        this.$run_btn.prop('disabled', true);
        this.$step_btn.prop('disabled', true);
        this.$pause_btn.prop('disabled', false);
        this.halt = false;
    }

    Ui.prototype.reset = function () {
        this.pause();
        this.life.randomfill();
        this.paint();
    }

    Ui.prototype.step_update = function () {
        this.life.step();
        this.paint();
    }

    Ui.prototype.pause = function () {
        clearTimeout(this.frameTimer);
        this.$run_btn.prop('disabled', false);
        this.$step_btn.prop('disabled', false);
        this.$pause_btn.prop('disabled', true);
        this.halt = true;
    }

    Ui.prototype.paint = function () {
        this.world_ui.clearRect(0, 0, this.w, this.h);
        for (var x = 0; x < this.cols; ++x) {
            for (var y = 0; y < this.rows; ++y) {
                var cell = this.life.get(x,y);
                if (cell.alive) {
                    this.world_ui.fillStyle = this.CellColors[cell.color];
                    this.world_ui.beginPath();
                    this.world_ui.rect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
                    this.world_ui.fill();
                }
            }
        }
        this.$generation_ui.text(this.life.generation);
        this.$population_ui.text(this.life.population_t);
    }

    Ui.prototype.update = function () {
        this.life.step();
        this.paint();
        this.frameTimer = setTimeout(this.update.bind(this), this.frameDelay);
    }

    Ui.prototype.paintGrid = function () {
        //this.grid_ui.beginPath();
        //this.grid_ui.rect(0, 0, this.w, this.h);
        //this.grid_ui.fill();
        for (var x = 0; x <= this.w; x += this.cellSize) {
            this.grid_ui.beginPath();
            this.grid_ui.moveTo(x, 0);
            this.grid_ui.lineTo(x, this.h);
            this.grid_ui.stroke();
        }
        for (var y = 0; y <= this.h; y += this.cellSize) {
            this.grid_ui.beginPath();
            this.grid_ui.moveTo(0, y);
            this.grid_ui.lineTo(this.w, y);
            this.grid_ui.stroke();
        }
    }
    /* ================== End of Ui class ================ */


    /* ================== Utilities ================ */
    // Compatibility fix
    if (String.prototype.repeat === undefined) {
        String.prototype.repeat = function (num)
        {
            return new Array(num + 1).join(this);
        }
    }

    // Add segments to a slider
    $.fn.addSliderSegments = function (amount, orientation) {
        return this.each(function () {
            if (orientation == "vertical") {
              var output = ''
              , i;
              for (i = 1; i <= amount - 2; i++) {
                output += '<div class="ui-slider-segment" style="top:' + 100 / (amount - 1) * i + '%;"></div>';
            };
            $(this).prepend(output);
            } else {
                var segmentGap = 100 / (amount - 1) + "%";
                var segment = '<div class="ui-slider-segment" style="margin-left: ' + segmentGap + ';"></div>';
                $(this).prepend(segment.repeat(amount - 2));
            }
        });
    };
    /* ================== End of Utilities ================ */

    /* ================== Essential definitions ================ */
    var Rules = Object.freeze({
        "GAME_OF_LIFE"          : { B:[3], S:[2, 3] },
        "LIFE_WITHOUT_DEATH"    : { B:[3], S:[1, 2, 3, 4, 5, 6, 7, 8] },
        "HIGHLIFE"              : { B:[3, 6], S:[2, 3] },
        "MAZE"                  : { B:[3], S:[1, 2, 3, 4, 5] },
        "SEEDS"                 : { B:[2], S:[] },
    });
    /* ================== End of Essential definitions ================ */

    // Actions
    var ui = new Ui(Rules);

});