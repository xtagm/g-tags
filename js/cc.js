/**
 * @license @title Content Controller and View
 * @author DENIS ROUSSEAU
 * @version 9.0
 */
/*jslint nomen: true, plusplus: true, regexp: true, evil: true, continue: true*/
/**
 * Content Resources Strings
 */
var crs=
{
    helper:'CTA %1 > Move your mouse over page elements, Right click to %2, Click here or reload or change tab or [Esc] to stop.',
    helperChart:'pin chart',
    helperSpy:'copy type and name',
    noCTA:"No CTA tracked with XTM or SETM in this page.",
    notGranted:'You are not granted to see this website results',
    playVideo:'Play video at least one second to allow data retrieving',
    chartInPage:"Drag & drop to move, double click to remove, right click to copy data"
};
/**
 * Content View
 */
var cv=
{
    helper:null,
    rubber:null,
    tip:null,
    /**
     * Calculate absolute position of element
     */
    getOffsetRect : function (elem) 
    {
        var box = elem.getBoundingClientRect(), body = document.body, docElem = document.documentElement,
        scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
        scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
        clientTop = docElem.clientTop || body.clientTop || 0, 
        clientLeft = docElem.clientLeft || body.clientLeft || 0,
        top  = box.top +  scrollTop - clientTop,
        left = box.left + scrollLeft - clientLeft;
        
        return { top: Math.round(top), left: Math.round(left), width:Math.round(box.width), height:Math.round(box.height) };
    },
    /*********************************
     * Rubber manager 
     */
    showRubber : function(node)
    {
        var r = cv.rubber, u = 'px', rc = cv.getOffsetRect(node);                      
        if (! r)
        {
            cv.rubber = r = document.createElement('div');
            r.className='xtm-rubber';
            document.body.appendChild(r); 
        } 
        r.style.width = rc.width+u;
        r.style.height = rc.height+u;
        r.style.left = rc.left+u;
        r.style.top = rc.top+u;
        r.style.display = 'block'; 
        r.style.pointerEvents='none';       
    },
    hideRubber : function()
    {
        if (cv.rubber)
        {
            cv.rubber.style.display = 'none';
        }  
    },
    destroyRubber: function()
    {
        if (cv.rubber)
        {
            document.body.removeChild(cv.rubber); 
            cv.rubber = null ; 
        }       
    },
    /**
     * Tip manager 
     */
    showTip:function(node, msg, delay)
    {
        var t = cv.tip, u = 'px', rc = node.getBoundingClientRect(), rcm, h,w,db=document.body,de=document.documentElement;                      
        if (! t)
        {
            cv.tip = t = document.createElement('div');       
            t.className='xtm-tip';            
            document.body.appendChild(t); 
        }              
        t.innerHTML=msg||cp.getNodeTip(node);        
        rcm=t.getBoundingClientRect();        
        w=(rcm.right-rcm.left);
        h=(rcm.bottom-rcm.top);
        t.style.top=Math.max(0,(Math.min(rc.bottom+h-1,(de.clientHeight||db.clientHeight||0))-h)).toString()+u;
        t.style.left=Math.max(0,(Math.min(rc.left+w,(de.clientWidth||db.clientWidth||0))-w)).toString()+u;          
        t.style.visibility="visible";
        t.style.opacity="1";    
        if (delay)
        {
            setTimeout(cv.hideTip, delay);
            t.classList.add('xtm-help');
        }
        else
        {
            t.classList.remove('xtm-help');
        }
    },
    showTipCopied : function()
    {
        var s='', msg=' Copied ';
        if (cv.tip && cv.tip.innerHTML!==msg)
        {
            s=cv.tip.innerHTML;
            cv.tip.innerHTML=msg;
            setTimeout(function(){if (cv.tip){cv.tip.innerHTML=s;}},1500);
        }
        return s;
    },    
    hideTip : function()
    {
        if (cv.tip)
        {
            cv.tip.style.visibility = 'hidden';
        }
    },
    destroyTip : function()
    {
        if (cv.tip)
        {
            window.document.body.removeChild(cv.tip); 
            cv.tip = null ;   
        }        
    },
    /**
     * Helper manager 
     */
    showHelper:function(chartActive, onMouseDown)
    {
        var h = cv.helper;                      
        if (! h)
        {
            cv.helper = h = document.createElement('div'); 
            h.className='xtm-tip xtm-help xtm-stopper';            
            document.body.appendChild(h);                     
            h.addEventListener('mousedown', onMouseDown);
        }  
        h.innerHTML=crs.helper.replace('%1',chartActive?'Charts':'Spy').replace('%2',chartActive?crs.helperChart:crs.helperSpy);        
        h.style.top="2px";
        h.style.left="2px";          
        h.style.visibility="visible";
        h.style.opacity="1";    
        setTimeout(cv.reduceHelper,4000);
    },
    reduceHelper:function()
    {
        if (cv.helper)
        {
            var aMsg=cv.helper.innerHTML.split(' &gt; ');
            cv.helper.innerHTML=aMsg[0]+'...';      
            cv.helper.setAttribute('title', aMsg[1]);
        }            
    },
    fadeHelper : function()
    {
        if (cv.helper)
        {
            cv.helper.style.opacity="0";
        }
    },      
    hideHelper:function()
    {
        if (cv.helper)
        {
            cv.helper.style.visibility="hidden";
        }
    },
    destroyHelper : function()
    {
        if (cv.helper)
        {
            window.document.body.removeChild(cv.helper); 
            cv.helper = null ;   
        }        
    },
    toImageDiv:function(rc)
    {
        if (window.ch && ch.v.chart && ch.v.canvas)
        {
            var img=document.createElement('img'), div=document.createElement('div');
            div.title=crs.chartInPage;
            
            div.className="xtm-pinchart";
            div.style.left = rc.left.toString()+'px';
            div.style.top = rc.top.toString()+'px';            
                       
            img.src = ch.v.canvas.toDataURL();
            img.width=ch.v.canvas.style.width.replace('px','');
            img.height=ch.v.canvas.style.height.replace('px','');            
            img.style.pointerEvents='none';

            div.appendChild(img);
            document.body.appendChild(div);
            return div;                                       
        }
        return null;
    },      
    toDataNode:function(node)
    {
        var t=document.createElement('textarea');
        t.style.display='none';
        t.innerHTML=ch.m.getLastDataSummary();
        node.appendChild(t);
        return t;
    },
    getDataText:function(parent)
    {
        var an=parent.getElementsByTagName('textarea'); 
        return (an && an.length)?an[0].value:'';       
    }  
};

/**
 * Content Controler
 * @constructor
 */
var cc =
{ 
    clipboard:'',
    /**
     * Targeted Tab and activation
     */
    tabid : null, 
    enabled : false,
   /**
    * Nodes management
    */
    nodes:[],
    state:
    {
        node:null,
        style:{},
        on:false
    },
    /**
     * Pined chart position (drag & drop)
     */
    pchart:{pos:0,down:false,offset:[0,0]},
    /**
     * Mouse position 
     */
    pos:{x:0,y:0},    
    posInNode:function(node)
    {
        var rc=node.getBoundingClientRect();
        return rc.x <= cc.pos.x && cc.pos.x <= rc.x + rc.width &&
               rc.y <= cc.pos.y && cc.pos.y <= rc.y + rc.height;    
    },
    /**
     * Lister 
     */
    list:
    {
        index:-1,
        count:0,
        map:{},
        text:'' 
    },
    /*********************************
     * Initialisation & User settings
     */
    initUserSettings : function(activate)
    {
        chrome.runtime.sendMessage({type: 'tc_userSettings', 'activate':activate}, function(response)
        {
            if (response && response.user)
            {
                cc.onUserSettings(response.user, response.activate);
            }
        });        
    },
    onUserSettings:function(user, activate)
    {
        cp.setUser(user);
        if (window.ch)
        {
            ch.m.initPeriod(user.period);
        }   
        if (activate)
        {
            cc.activateView();
        }   
    },
    
    /*******************************
     * Node highlighting 
     */
    nodeOn : function(n)
    {
        if (cc.state.on)
        {
            return ;
        }
        if (n)
        {
            cc.state.node=n;
        }
        cv.showRubber(cc.state.node);            
        cc.state.style.opacity = cc.state.node.style.opacity ;
        cc.state.node.style.opacity = 0.6 ;                 
        if (window.ch && ch.c.active)
        {
            ch.v.destroy();
        }          
        /* Send event to window to get name prepared */
        cc.state.node.setAttribute(cp.selat,'');
        window.dispatchEvent(new CustomEvent(cp.tagQuestion, {'detail':{selat:cp.selat}}));                    
    },
    nodeOff : function()
    {
        if (! cc.state.on)
        {
            return ;
        }
        cc.state.node.style.opacity = cc.state.style.opacity ;
        cv.hideRubber();          
        cv.hideTip();
        if (window.ch)
        {
            ch.v.hide();
        }
        cc.state.on = false ;   
        cc.state.node=null;
            
    },    
    /*********************************
     * Chart manager 
     */
    setChart:function(node)
    {
        ch.v.show(node);  
        if (cp.isVideo())
        {
            cv.rubber.style.pointerEvents='auto';
            cv.rubber.addEventListener("mousedown", cc.onMouseDown, true);
        }
        else
        {
            cv.rubber.removeEventListener("mousedown", cc.onMouseDown, true);
        }
        ch.v.beginWait();
        cp.getChartData(cc.onChartDataSuccess, cc.onChartDataFailure);          
    },  
    /**
     * Chart Data events 
     */    
    onChartDataSuccess:function(result)
    {
        if (cc.state.node===result.node /*&& (cp.isVideo() || cc.posInNode(cc.state.node))*/)
        {
            cp.onChartData(result);
            ch.v.endWait();            
            ch.c.fill();                    
        }
        else
        {
            ch.v.hide();
        }
    },    
    onChartDataFailure:function(status)
    {
        switch (status)
        {
        case 0:
            /*
             * Queued event: retry every 0.5s
             */
            setTimeout(function(){cp.getChartData(cc.onChartDataSuccess, cc.onChartDataFailure);},500);
            break;
        case 401:
        case 403:
            chrome.runtime.sendMessage({type: 'tc_message', text:crs.notGranted});
            cc.disableView();
            cc.onDisableView();
            break;
        default:
            ch.v.hide();
            cv.showTip(cc.state.node, 'Data cannot be retrieved (status:'+status.toString()+')', 1500);
            break;
        }
    },
    /**
     * Pinned Chart events 
     */
    pinChart:function()
    {
        var div=cv.toImageDiv(cv.getOffsetRect(ch.v.host));
        if (div)
        {
            div.addEventListener('dblclick', cc.onChartDoubleClick, true);
            div.addEventListener('mousedown', cc.onChartMouseDown, true);
            div.addEventListener('mouseup', cc.onChartMouseup, true);
            div.addEventListener('mousemove', cc.onChartMove, true);  
            ch.v.hide();     
            cv.toDataNode(div);                                  
        }
        return div ;
    },    
    onChartDoubleClick:function(e)
    {
        document.body.removeChild(e.target);
    },    
    onChartMouseDown:function(e) 
    {
        if (e.button===2)
        {
            var t=cv.getDataText(e.target);
            if (t)
            {
                ch.c.addCopy(t);
                setTimeout(function(){ch.v.showTip('Chart data copied', 1500, null, e.target);});
            }        
        } 
        else
        {
            cc.pchart.down=true;
            cc.pchart.offset=[e.target.offsetLeft-e.clientX,e.target.offsetTop-e.clientY];                   
        }                
        e.stopPropagation();
        e.preventDefault();
        return false;
    },
    onChartMove:function(e)
    {
        if (cc.pchart.down && e.target.className==='xtm-pinchart') 
        {
            var pos = {x:e.clientX, y:e.clientY};
            e.target.style.left = (pos.x + cc.pchart.offset[0]) + 'px';
            e.target.style.top  = (pos.y + cc.pchart.offset[1]) + 'px';
            e.target.style.cursor="move"; 
            e.preventDefault();            
        }
    },
    onChartMouseup:function(e)
    {
        cc.pchart.down = false;
        cc.pchart.offset= [0,0];    
        e.target.style.cursor="default";    
    },    
    /*********************************
     * Activation / Deactivation
     */   
   /**
     * Collect all tracked nodes
     */ 
    collectNodes : function()
    {
        cc.nodes=document.querySelectorAll('['+cp.markat+']');
    }, 
    /**
     * Add event listeners for all elements in the current document
     */ 
    addEventListeners : function()
    {
        var i = 0;
        cc.removeEventListeners() ;
        cc.collectNodes();
        if (cc.nodes.length===0)
        {
            chrome.runtime.sendMessage({type: 'tc_message', text:crs.noCTA});
            cc.onDisableView();
            return false;
        }

        for (i = 0; i < cc.nodes.length; i++)   
        {
            cc.nodes[i].addEventListener("mouseover", cc.onMouseOver, false);
            cc.nodes[i].addEventListener("mouseout", cc.onMouseOut, false);
            cc.nodes[i].addEventListener("mousemove", cc.onMouseMove, false);
        }   

        /* Set event handler for right click */
        document.addEventListener("mousedown", cc.onMouseDown);
        if (window.ch && ch.c.active)
        {
            document.addEventListener("click", cc.onClickFreeze);
        }
        document.addEventListener("contextmenu", cc.onContextMenu);
        
        /* Set event handler for esc key */
        document.addEventListener("keydown", cc.onKeyDown);
        
        window.addEventListener(cp.tagResponse, cc.onTagViewResponse);

        chrome.runtime.sendMessage({type:'bm_focustab'});               
      
        return true;
    },
    /**
     * Remove event listeners for all elements in the current document
     */
    removeEventListeners : function()
    {
        var i = 0;
        for (i = 0; i < cc.nodes.length; i++)
        {
            cc.nodes[i].removeEventListener("mouseover", cc.onMouseOver, false);
            cc.nodes[i].removeEventListener("mouseout", cc.onMouseOut, false);
            cc.nodes[i].removeEventListener("mousemove", cc.onMouseMove, false);
        }   
        cc.nodes = [] ;
        document.removeEventListener("mousedown", cc.onMouseDown);
        document.removeEventListener("click", cc.onClickFreeze);
        document.removeEventListener("keydown", cc.onKeyDown);
        document.removeEventListener("contextmenu", cc.onContextMenu);
        window.removeEventListener(cp.tagResponse, cc.onTagViewResponse);
    },
    /**
     * Enable tag lister
     * @param {integer} tid Current tab
     */
    isNodeVisible:function(node) 
    {
        var style = window.getComputedStyle(node);
        return (style.display !== 'none');
    },
    enableList : function(tid)
    {      
        cc.clipboard='';  
        cc.collectNodes();
        if (cc.nodes.length)
        {            
            cc.list.index=-1;
            cc.list.map={};
            cc.doTrackedList();                     
        }
        else
        {
            chrome.runtime.sendMessage({type: 'tc_message', text:crs.noCTA});
        }
    },     
    doTrackedList:function()
    {
        cc.list.index++;
        if (cc.list.index>=0 && cc.list.index<cc.nodes.length)
        {
            if (cc.list.index===0)
            {                
                cc.list.count=0;
                cc.list.text='';
                window.addEventListener(cp.tagResponse, cc.onTagListResponse);
            }
        }
        if (cc.list.index<cc.nodes.length)
        {
            cc.nodes[cc.list.index].setAttribute(cp.selat,'');
            window.dispatchEvent(new CustomEvent(cp.tagQuestion, {'detail':{selat:cp.selat}}));
        }        
        else
        {
            cc.list.index=-1;
            window.removeEventListener(cp.tagResponse, cc.onTagListResponse);
            if (cc.list.count>0)
            {
                var msg=cc.list.count.toString()+ " tracked CTA have been copied in the clipboard";
                var t=cp.getNodeDescHeader()+cc.list.text;
                cc.copyToClipboard(t) ;
                /*
                chrome.runtime.sendMessage({type:'bm_copy', text:t}, function()
                {
                    chrome.runtime.sendMessage({type: 'tc_message', text:msg});
                }); 
                */
            }           
        }
    },
    /**
     * Disable tag lister
     * @param {integer} tid Current tab
     */
    disableList : function(tid)
    {  

    },    
    /**
     * Enable tag viewer
     * @param {integer} tid Current tab
     */
    enableView : function(tid, chart)
    {
        cc.clipboard = '';
        if (!cc.enabled)
        {
            cc.tabid = tid;
            if (window.ch)
            {
                ch.c.active=(chart!==undefined)?chart:false;
                if (ch.c.active)
                {            
                    cc.initUserSettings(true);
                    return;
                }                
            }            
            cc.activateView();    
        }
    }, 
    activateView:function()
    {
        cc.enabled=cc.addEventListeners();  
        if (cc.enabled)
        {
            cv.showHelper(window.ch?ch.c.active:false, function(e) 
            {
                cv.fadeHelper();
                setTimeout(cc.stopView,500);
                return false;                
            }, true);
        }        
    },   
    /**
     * Disable tag viewer
     * @param {integer} tid Current tab
     */
    disableView : function(tid)
    {  
        if (cc.enabled) 
        {
            if (cc.state.node)
            {
                cc.nodeOff();
            }
            cv.destroyRubber();
            cv.destroyTip();  
            cv.destroyHelper();
            if (window.ch)
            {
                ch.v.destroy(true);
            } 
            cp.disable();                
            cc.removeEventListeners();   
            cc.enabled = false;
        }
    },
    stopView:function()
    {
        cc.disableView();       
        cc.onDisableView();
    },   
    /*********************************
     * Events Handlers
     */
    copyTip : function()
    {
        var s=cp.ctaFromTip(cv.showTipCopied());
        if (s)
        {
            cc.clipboard+=s+'\r\n';
            navigator.clipboard.writeText(cc.clipboard);
        }
    },    
    onMouseOver : function(e)
    {
        if (cc.enabled)
        {   
            if (this.tagName !== 'body') 
            {
                cc.nodeOn(this);
            }                    
        }
        e.stopPropagation();
    },
    
    onMouseOut : function(e)
    {
        if (cc.state.node && e.relatedTarget!==cv.rubber)
        {
           cc.nodeOff();
        }
        e.stopPropagation();
    },
    
    onMouseMove : function(e)
    {
        cc.pos.x=e.clientX;
        cc.pos.y=e.clientY;
        e.stopPropagation();
    },
    
    onMouseDown : function(e)
    {
        if (e.button===2) 
        {     
            if (window.ch && ch.c.active)
            {
                cc.pinChart();
            }
            else
            {
                cc.copyTip();
            } 
        } 
        e.stopPropagation();
        return true;
    },
    onClickFreeze : function(e)
    {
       if (e.target.tagName==='A' && node.getAttribute('href')!=='#')
       {
           e.preventDefault();
           e.stopImmediatePropagation();
       }
    },
    onKeyDown : function (e)
    {
        if (e.keyCode===27 && cc.enabled ) 
        {
            cc.stopView();
        } 
        else if (e.keyCode===107 && window.ch && ch.c.active)
        {
            cc.pinChart();
        }
        return false;
    },
    /**
     * Prevent context menu 
     */
    onContextMenu : function(e)
    {
        e.preventDefault();  
    },
    /**
     * Specific events 
     */
    onDisableView:function()
    {
        chrome.runtime.sendMessage({type: 'tc_disableView', tabId:cc.tabid});
    },    
    onTagViewResponse : function(e)
    {
        if (e.detail)
        {
            cc.state.on = true ;
            cp.setTagResponse(cc.state.node, e.detail);            
            if (window.ch && ch.c.active)
            {
                if (cp.isValid())
                {
                    setTimeout(function(node)
                    {
                        if (node===cc.state.node)
                        {                      
                            cc.setChart(node);
                        }
                    }, 800, cc.state.node);
                }
                else if (cp.isVideo())
                {
                    cv.showTip(cc.state.node, crs.playVideo, 3000);
                }
            }  
            else
            {          
                cv.showTip(cc.state.node);
            }
        }
    },  
    onTagListResponse : function(e)
    {
        if (e.detail)
        {
            cp.setTagResponse(cc.nodes[cc.list.index], e.detail);
            var s=cp.getNodeDesc(cc.nodes[cc.list.index], cc.list.map), msg='';
            if (s)
            {
                cc.list.count++;
                cc.list.text+=s+'\r\n';
                msg=cc.list.count.toString()+'/'+cc.nodes.length.toString()+' tracked CTA reported';
                chrome.runtime.sendMessage({type:'tc_message', text:msg, nohide:true}, function()
                {
                    setTimeout(cc.doTrackedList,1);
                });
                return;
            }                    
        }
        setTimeout(cc.doTrackedList,1);     
    }      
};

/****************************************
 * Event listener to check current status
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
    switch (request.type)
    {
    case 'cc_loaded':
        sendResponse({status:true});
        break;
    case 'cc_enabled':
        sendResponse({status:cc.enabled});
        break; 
    case 'cc_charts':
        sendResponse({status:(typeof Chart!=='undefined')});
        break;    
    case 'cc_userSettings':
        if (request.user)
        {
            cc.onUserSettings(request.user, request.enable);
        }
        break;
    case 'cc_persist':
        if (window.ch && ch.c.active)
        {
            cc.pinChart();
        }
        else
        {
            cc.copyTip();
        } 
        break; 
    }
});

