(function(){
    if (CanvasRenderingContext2D.prototype.ellipse == undefined) {
        CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
            this.save();
            this.translate(x, y);
            this.rotate(rotation);
            this.scale(radiusX, radiusY);
            this.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
            this.restore();
        }
    }
    if(!supportsPath2D){
        console.log('supportsPath2D: ',supportsPath2D);
        function Path2D_(){
            this.commandArrays = [];
        }
        Path2D_.prototype.moveTo = function(x,y){
            this.commandArrays.push({type:'move',coord:[x,y]})
        };
        Path2D_.prototype.lineTo = function(x,y){
            this.commandArrays.push({type:'line',coord:[x,y]})
        };

        Path2D_.prototype.bezierCurveTo = function(cx,cy,x,y){
            this.commandArrays.push({type:'bezierCurve',coord:[cx,cy,x,y]})
        };

        Path2D_.prototype.drawToContext = function(ctx){
            var command,i, len = this.commandArrays.length;
            ctx.beginPath();
            for(i=0;i<len;i+=1){
                command = this.commandArrays[i];
                switch(command.type){
                    case "move":
                        ctx.moveTo(command.coord[0],command.coord[1]);
                        break;
                    case "line":
                        ctx.lineTo(command.coord[0],command.coord[1]);
                        break;
                    case "bezierCurve":
                        ctx.bezierCurveTo(command.coord[0],command.coord[1],command.coord[2],command.coord[3]);
                        break;
                }
            }
            ctx.closePath();
        };
        Path2D = Path2D_;
    }
}())