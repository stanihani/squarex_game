(function(){
    /// game logic
    var new_gdata = function(){
        return {
            last_frame: Date.now(),
            player: {
                x: 20,
                y: 0,
                w: 10,
                h: 10,
                vy: 0,
                vx: 0,
                jp: 9,
                c: 'rgba(20,180,120,1)',
            },
            ground: {
                x: 0,
                y: 0,
                w: 0,
                h: 40,
                c: 'rgba(200,200,200,1)',
            },
            obsticles: [],
            clouds: [
            ],
            orange: {
                minW: 10,
                minH: 10,
                maxW: 100,
                maxH: 100,
                minD: 200,
                maxD: 2000,
            },
            crange: {
                minW: 40,
                minH: 10,
                maxW: 60,
                maxH: 20,
                maxZ: 30,
                minZ: 10,
                coll_c: 'rgba(0,191,255,1)',
            },
            nclouds: 10,
            input: false,
            gravity: -10,
            speed: 200,
            distance: 0,
            score: 0,
        };
    };

    var _crS = function(){
        var x = document.createElement('canvas');
        document.body.appendChild(x);

        x.style.position = 'absolute';
        x.style.left = 0+'px';
        x.style.top = 0+'px';
        x.style.width = 800+'px';
        x.style.height = 400+'px';
        x.style.backgroundColor = 'black';
        x.width = 800;
        x.height = 400;

        el.canvas = x;
        el.ctx = x.getContext('2d');

        gdata.input_ev = window.addEventListener('keydown',function(e){ 
            gdata.input = e.keyCode;                    
        });

        el.sound = load_sound_engine();
    };

    var do_collide = function(a,b){
        return !(
            ((a.y + a.h) < (b.y)) ||
            (a.y > (b.y + b.h)) ||
            ((a.x + a.w) < b.x) ||
            (a.x > (b.x + b.w))
        );        
    };

    var _exeF = function(){
        
        /// set framebuffer
        var frabu = [];
        var go = false;

        /// debug
        
        if(gdata.input === 27){
            var p = window.confirm('Do you want to quit?');
            if(p === true){
                el.canvas.parentElement.removeChild(el.canvas);
                return;
            }else{
                gdata.last_frame = Date.now();
            };
        };

        var ft = Date.now();

        /// apply gravity
        var dt = ft-gdata.last_frame;
        var dg = (gdata.gravity/1000)*dt;
        if(gdata.input === 40){
            dg-=10;
            el.sound.play(250,'sawtooth',50,0,0.5);
        };
        gdata.player.vy += dg;
        gdata.player.y -= gdata.player.vy;       

        /// ground collision
        gdata.ground.w = el.canvas.width;
        gdata.ground.y = el.canvas.height-gdata.ground.h;
        
        /// apply jump
        if(gdata.player.y +gdata.player.h >= gdata.ground.y){
            gdata.player.y = gdata.ground.y-gdata.player.h;
            
            if(gdata.input === 32){
                gdata.player.vy = gdata.player.jp;
                el.sound.play(1000,'sawtooth',100,0,0.5);
            }else{
                gdata.player.vy = 0;
            };
        };


        /// update clouds
        for(var i = 0;i<Math.max(gdata.clouds.length,gdata.nclouds);i++){


            /// create cloud
            var x = false;
            if(!gdata.clouds[i]){
                gdata.clouds.push({
                    x: el.canvas.width+(Math.random()*el.canvas.width),
                    y: Math.max(40,Math.random()*el.canvas.height/2),
                    w: Math.max(gdata.crange.minW,Math.random()*gdata.crange.maxW),
                    h: Math.max(gdata.crange.minH,Math.random()*gdata.crange.maxH),
                    c: 'white',
                    z: Math.max(gdata.crange.minZ,Math.random()*gdata.crange.maxZ),
                });
            };

            /// update cloud
            x = gdata.clouds[i];
            x.x += -(((gdata.speed/100)*x.z)/1000)*dt;
            if(x.x + x.w < 0){
                if(i > gdata.nclouds){
                    gdata.clouds.splice(i,1);
                    i--;
                    continue;
                }else{
                    x.x = el.canvas.width;
                    x.c = 'white';
                };
            };
            if(do_collide(x,gdata.player) && x.c !== gdata.crange.coll_c){

                x.c = gdata.crange.coll_c;
                gdata.score += 500;
                el.sound.play(2500,'sine',50,0,0.8);
            };
            frabu.push(x);
        };

        /// update obsticles
        var last_o = 0;
        for(var i = 0;i<gdata.obsticles.length;i++){

            var x = gdata.obsticles[i];
            x.x -= gdata.speed/1000*dt;
            if(x.x+x.w < 0){
                gdata.obsticles.splice(i,1);
                i--;
            };
            if(last_o < x.d){
                last_o = x.d;
            }
            if(do_collide(gdata.player,x)){
                go = true;
                x.c = 'rgba(255, 64, 0,1)';
            };
            frabu.push(x);
        };
        if(gdata.distance-last_o > Math.max(500,Math.random()*2000) && Math.random() > 0.7 ){
            var h = Math.max(gdata.orange.minH,Math.random()*gdata.orange.maxH);
            gdata.obsticles.push({
                x: el.canvas.width,
                y: el.canvas.height-(gdata.ground.h+h),
                h: h,
                w: Math.max(gdata.orange.minW,Math.random()*gdata.orange.maxW),
                c: 'white',
                d: gdata.distance,
            });
        };
    
        
        
        



        ////////////////////////////////////////////////
        /// draw stuff
        frabu.push(gdata.player);
        frabu.push(gdata.ground);

        // reset canvas
        el.ctx.fillStyle = 'black';
        el.ctx.fillRect(0,0,el.canvas.width,el.canvas.height);

        for(var i = 0;i<frabu.length;i++){
            el.ctx.fillStyle = frabu[i].c;
            el.ctx.fillRect(
                frabu[i].x,
                frabu[i].y,
                frabu[i].w,
                frabu[i].h,
            );  
        };

        /// finalize
        gdata.last_frame = ft;
        gdata.input = false;
        gdata.speed += dt/1000;
        gdata.score = (gdata.score+gdata.speed/10000*dt);
        gdata.distance += gdata.speed/1000*dt;
    

        /// render score
        el.ctx.fillStyle = 'White';
        el.ctx.font = '20px monospace';
        el.ctx.fillText('SCORE: '+ Math.round(gdata.score),10,30);

        /// render credits
        el.ctx.fillStyle = 'black';
        el.ctx.font = '15px monospace';
        el.ctx.fillText(
            'Made by: Stanislav Hutter - Oct 04, 2020',
            10,
            el.canvas.height-15
        );
        

        /// request next frame
        if(go === true){
            el.sound.play(40,'sawtooth',500,0,0.5);
            setTimeout(function(){
                var c = confirm([
                    'Game Over!\n',
                    'Score:'+Math.round(gdata.score),
                    'Distance:'+Math.round(gdata.distance),
                    '\nPlay on more time?'
                ].join('\n')); 
                if(c === true){
                    gdata = new_gdata(); 
                    requestAnimationFrame(_exeF);
                }else{
                    el.canvas.parentElement.removeChild(el.canvas);
                };
            },500);

            return;
                    
        };


        gdata.last_frame = ft;
        requestAnimationFrame(_exeF);
    };

    var load_sound_engine = function(){
        var x = new(window.AudioContext || window.webkitAudioContext)();

        x.play = function(f,t,d,pd,v){
            if(!pd){
                pd = 0;
            };
            if(!v){
                v = 1;
            };
            setTimeout(function(){
                var s = x.createOscillator();
                var vol = x.createGain();

                vol.gain.value = v;
                s.type = t;
                s.frequency.value = f;
                s.connect(x.destination);
                s.connect(x.destination);
                s.start();
                s.stop(x.currentTime+d/1000); 
            },pd);

        };

        return x;

    };

    /// start game
    var gdata = new_gdata();
    var el = {};

    _crS();
    requestAnimationFrame(_exeF);
})();