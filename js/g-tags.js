/******************************************************************************
 * @title G-Tags
 * @author DENIS ROUSSEAU
 * @version 1.0
 ******************************************************************************/
/*jslint nomen: true, plusplus: true, regexp: true*/
/**
 * X-Tags Controller
 */
var gt=
{
    browser : window.chrome||window.browser,
    record : true,
    timeout : 0,
    translate :true,
    lastSite : 0,
    timer : null,
    aufilter:["*://*.google-analytics.com/__utm.gif*",
	"*://*.google-analytics.com/r*",
	"*://*.google-analytics.com/collect*",
	"*://stats.g.doubleclick.net/__utm.gif*",
	"*://stats.g.doubleclick.net/collect*",
	"*://stats.g.doubleclick.net/r*"],
    apirest :'',
    apiauth : '',
    rqdone : {},
    /**
     * Parse URL parameters
     */
    getUrlParser : function(u)
    {
        var params={};
        u.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), function(b, a, d, c)
        {
            params[a.toLowerCase()] = c;
        });
        return params;
    },
    /**
     * Retrieve URL without protocol
     */
    getUrl : function(u)
    {
        return (/(?:https?:\/\/)?(.*)$/i.exec(u)[1]);
    },    
    /**
     * Retrieve parameter title from description array
     */
    getTitle : function(ap)
    {
        return (((ap.length>1 && gt.translate)?ap[1]:'')||ap[0]);
    },
    /**
     * Retrieve parameter label
     */
    getParamLabel : function(param)
    {
        var label=(gtc.label[param]||param).replace(/ /g,'&nbsp;'), an=[],pl=param, i=0;
        if (label===param)
        {
            an=param.match(/[0-9]+/g);
            if (an && an.length)
            {
                for (i=0;i<an.length;i++)
                {
                    pl=pl.replace(an[i],'_I_');
                }
                label=gtc.label[pl];
                if (label)
                {
                    for (i=0;i<an.length;i++)
                    {
                        label=label.replace('$'+i.toString(),an[i]);
                    }
                    label=label.replace(/ /g,'&nbsp;');
                }
                else
                {
                    label=param;
                }                
            }
        }
        return label;       
    },
    /**
     * Retrieve parameter value and possibly its translation, based on internal settings or API REST call
     */
    getValue : function(params, ap)
    {
        var v=params[ap[0]],i=0,av=[],local=false,lv='',rv='';
        if (v)
        {
            v=decodeURIComponent(v);
            rv=v;
            if (ap.length>=2)
            {
                if (ap[1]==='site')
                {
                    gt.lastSite=v;
                }        
                if (ap.length>2 && gt.translate)
                {
                    if (local)
                    {
                        lv=v;
                        v=rv;
                    }
                    gt.translate=false;
                    for (i=2;i<ap.length;i++)
                    {
                        av=ap[i].split(':');
                        if (av.length===2 && (av[0]==='*'||av[0]===v.toLowerCase()))
                        {
                            v=((av[1].charAt(0)==='-')?(v+' - '+av[1].substr(1)):av[1]);
                            gt.translate=true;
                            break;
                        }
                    }
                    if (local)
                    {
                        v=lv;
                    }
                }
            }
            params[ap[0]]=null;  
        }
        return ((v==='undefined')?'':v);      
    },
    /**
     * Retrieve checkbox stored value
     */
    getCheckSetting : function(k, defval)
    {
        var v=localStorage[k];
        return (v?((v==='1')?true:false):defval);
    },
    recordChanged : function()
    {
        if (gt.record && !gt.timer)
        {
            gt.timer=window.setInterval(gt.onTimer, 1000);
        }
        else if (gt.timer)
        {
            window.clearInterval(gt.timer);
            gt.timer=null;
        }
    },
    /**
     * Clic on record light
     */
    onClickRecord : function(e)
    {
        this.classList.toggle(gtr.cnActive);
        gt.record=(this.className.indexOf(gtr.cnActive)>=0);
        this.title=(gt.record? gtr.sStop:gtr.sResume); 
        gt.recordChanged();       
    },
    /**
     * Checkbox actions
     */
    allCheckChanged : function(cbx,selector,visibleStyle,emptyVisible)
    {
        var an=document.querySelectorAll(selector), i=0;
        for (i=0;i<an.length;i++)
        {
            an[i].style.display=(cbx.checked&&(emptyVisible||an[i].textContent.replace(/(^\s*)/g, "")))?(visibleStyle||"block"):gtr.vNone;
        }
        localStorage[cbx.id]=(cbx.checked?'1':'0');
    },    
    typeCheckChanged : function(cbx, type)
    {
        gt.allCheckChanged(cbx, '.'+gtr.cnRq+'.'+type, gtr.vRow);
        if (gtr.cbDetails.checked)
        {
            gt.allCheckChanged(cbx, "."+type+"."+gtr.cnInfo + (gtr.cbAdvanced.checked? '':('.'+gtr.cnDetail)), gtr.vRow);
        }
    },
    infosCheckChanged: function(cbx, root)
    {
        if (gtr.cbPage.checked)
        {
            gt.allCheckChanged(cbx, '.'+gtr.cnPage+root, gtr.vRow);        
        }
        if (gtr.cbClic.checked)
        {
            gt.allCheckChanged(cbx, '.'+gtr.cnClic+root, gtr.vRow);        
        }
        if (gtr.cbOther.checked)
        {
            gt.allCheckChanged(cbx, '.'+gtr.cnOther+root, gtr.vRow);        
        }           
    },  
    detailsCheckChanged : function(checked)
    {
        var cbx=gtr.cbAdvanced;
        if (!checked)
        {
            cbx.checked=false;
        }
        cbx.disabled=!checked; 
    },
    /**
     * Checkbox events
     */     
    onCheckPage : function()
    {
        gt.typeCheckChanged(this, gtr.cnPage);
    },
    onCheckClick: function(e)
    {
        gt.typeCheckChanged(this, gtr.cnClic);
    },    
    onCheckOther: function(e)
    {
        gt.typeCheckChanged(this, gtr.cnOther);
    },     
    onCheckUrl: function(e)
    {
        gt.allCheckChanged(this, '.'+gtr.cnUrl, gtr.vCell, true);
    },       
    onCheckDetails: function(e)
    {
        gt.infosCheckChanged(this,(this.checked?('.'+gtr.cnInfo+'.'+gtr.cnDetail):('.'+gtr.cnInfo)));
        gt.detailsCheckChanged(this.checked);          
    }, 
    onCheckAdvanced: function(e)
    {
        gt.infosCheckChanged(this,'.'+gtr.cnInfo+'.'+gtr.cnAdvanced);
    },      
    /**
     * Clipoard copy event
     */
    onClickCopy : function(e)
    {
        var an=document.querySelectorAll('.'+gtr.cnRq), i=0, j=0, s='',ah=[];
        for (i=0;i<an.length;i++)
        {
            if (an[i].style.display===gtr.vRow)
            {
                ah=an[i].querySelectorAll('th');
                for (j=0;j<ah.length;j++)
                {
                    s+=ah[j].textContent+((j<ah.length-1)?'\t':'\r\n');
                }
            }
        }
        if (s)
        {
            gt.browser.runtime.sendMessage({type: 'copy', text: s});
            alert(gtr.sCopyDone);
        }        
    },
    /**
     * Clear content event
     */
    onClickClear : function(e)
    {
        gtr.dTags.innerHTML= "";
    },
    /**
     * Click on chevron event
     */
    onClickChevron : function(e)
    {
        gt.toggleBar(false);
        e.stopPropagation();
        return false;        
    },
    /**
     * Click on reduced bar header
     */
    onClickBar: function()
    {
        if (localStorage.visibleBar==="false")
        {
            gt.toggleBar(true);
        }
    },
    onDoubleClickBar: function()
    {
        if (localStorage.visibleBar==="true")
        {
            gt.toggleBar(false);
        }
    },    
    /**
     * Page load event
     */
    onLoad : function()
    {
        var i=0, acbx=['cbPage','cbClic','cbUrl','cbOther','cbDetails','cbAdvanced'], cev="click";
        gtr.bind();
        for (i=0;i<acbx.length;i++)
        {
            gtr[acbx[i]].checked=gt.getCheckSetting(gtr[acbx[i]].id,gtr[acbx[i]].checked);
        }
        gt.detailsCheckChanged(gtr.cbDetails.checked);
        gtr.cbPage.onchange = gt.onCheckPage;
        gtr.cbClic.onchange = gt.onCheckClick;
        gtr.cbUrl.onchange = gt.onCheckUrl;
        gtr.cbOther.onchange = gt.onCheckOther;
        gtr.cbDetails.onchange = gt.onCheckDetails;
        gtr.cbAdvanced.onchange = gt.onCheckAdvanced;        
        gtr.btCopy.addEventListener(cev, gt.onClickCopy);       
        gtr.btClear.addEventListener(cev, gt.onClickClear); 
        gtr.dRecord.addEventListener(cev, gt.onClickRecord);     
        gtr.dBar.addEventListener(cev, gt.onClickBar);  
        gtr.dBar.addEventListener('dblclick', gt.onDoubleClickBar); 
        gtr.dChevron.addEventListener(cev, gt.onClickChevron); 
        if (localStorage.visibleBar==="false")
        {
            setTimeout(function(){gt.toggleBar(false);}, 1000);
        }    
        gt.recordChanged(); 
    },
    /**
     * Resize event
     */
    onResize : function()
    {
        if (gt.timeout) 
        {
            clearTimeout(gt.timeout);
        }
        gt.timeout = setTimeout(function() 
        {
            gt.browser.runtime.sendMessage({type:'resize'});
            gt.timeout = 0;
        }, 100);        
    },
    /**
     * Toggle control bar
     */
    toggleBar : function(isVisible)
    {
        if (isVisible)
        {
            gt.rheight=gtr.dBar.clientHeight;
            gtr.dBar.classList.remove(gtr.cnReduced);
            setTimeout(function()
            {
                gtr.dContent.scrollTop+=gtr.dBar.clientHeight-gt.rheight+1;
            },300);
        }
        else
        {
            gtr.dBar.classList.add(gtr.cnReduced);
        }
        gtr.dBar.title=(isVisible? '':gtr.sExpand);
        localStorage.visibleBar=isVisible;
    },
    /**
     * Double-click on tag event
     */
    onDoubleClickTag : function(e)
    {
        var node=this.nextSibling,i=0,as=[],visible=false;
        if (node)
        {
            as.push(node);
            visible=(node.style.display!==gtr.vNone);
            node=node.nextSibling;
            if (node)
            {
                as.push(node);
                visible=(node.style.display!==gtr.vNone);
            }            
        }
        visible=!(visible);
        for (i=0;i<as.length;i++)
        {
            as[i].style.display=(visible&&(as[i].textContent.replace(/(^\s*)/g, "")))?gtr.vRow:gtr.vNone;
        }
        if (window.getSelection)
        {
            window.getSelection().removeAllRanges();
        }
        else if (document.selection)
        {
            document.selection.empty();
        }
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    },
    /**
     * Request recording
     */
    addRequest : function(rq,tu)
    {
        gt.rqdone[rq.requestId]={requestId:rq.requestId,tabId:rq.tabId,url:rq.url,timeStamp:rq.timeStamp,tabUrl:tu,done:false};
    },
    isFiltered : function(v)
    {
        var i=0,av=v.split(' ');
        for (i=0;i<gtc.filtered.length;i++)
        {
            if (av[0]===gtc.filtered[i])
            {
                return true;
            }
        }
        return false;
    },
    /**
     * Tag Recording
     */
    addTag : function(rq)
    {       
        /* Mark recorded entry as done */
        gt.rqdone[rq.requestId].done=true;  
        
        var node=null, content='', i=0, c=0, v='',param=null, params=gt.getUrlParser(rq.url),isBr=true, ah=[], scontent='',cn='', redirect=false,
        date=new Date(rq.timeStamp), hcmax=2,
        isUA=params.tid?true:false, isSite=false,
        isClick=((params.t==='event')||(params.utmt==='event')), 
        isOther=(!isClick&&((params.t && params.t!=='pageview')||(params.utmt && params.utmt!=='page'))),
        visible=((isClick && gtr.cbClic.checked) || (isOther && gtr.cbOther.checked) || (!isClick && !isOther && gtr.cbPage.checked)),
        withUrl= gtr.cbUrl.checked,        
        infos= gtr.cbDetails.checked, advanced=false, translate=false, label='',
        detailPrefix='<td colspan="6" class="detail">', paramPrefix='<span style="display:inline-block;"><span class="tooltip"><b>',
        indent1='<span class="treechild"></span>', indent2='<span class="treechild deep"></span>';
        
        gt.detailsCheckChanged(infos);
        advanced= gtr.cbAdvanced.checked;
        
        gt.translate=true;       
        
        /* Header row: Tag type column */  
        label=((isOther&&!isClick)? (params.utmt?gt.getValue(params, gtc.type):(params.t?gt.getValue(params, gtc.typeU):gtr.sOther)):gtr.sPage);
        content+='<th style="text-transform:capitalize;"><b>';
        content+=(isClick?(gtr.sClick+'&nbsp;</b>'):(label+'</b>'))+'</th>';
        /* Header row: site ID and possibly other columns */
        for (gt.translate=true,i=0,c=0;i<gtc.headers.length && c<2;i++)
        {
            v=gt.getValue(params, gtc.headers[i]);
            if (gtc.headers[i][1]==='site')
            {
                /* Check filtered sites */
                if (v && gt.isFiltered(v))
                {
                    return;
                }
                translate=gt.translate;
                if (v)
                {
                    isSite=true;
                    if (isUA)
                    {
                        v=v.replace('UA','<b>UA</b>');
                    }
                    v=v.replace(/-/g,'&#8209;');
                }
            }
            if (v)
            {
                content+='<th class="'+gtc.headers[i][1]+'">'+v+'</th>';
                c++;
            }
        } 
        if (!isSite)
        {
            return;
        }
        /* Header row: Ensure that max columns-2 have been created */
        for (i=c;i<hcmax-1;i++)
        {
            content+='<th></th>';
            c++;
        }        
        /* Header row: Name column, depending on tag type */
        ah = ((isClick)? gtc.hclic:(isOther? gtc.hother:gtc.hpage));
        for (gt.translate=true,i=0;i<ah.length;i++)
        {
            v=gt.getValue(params, ah[i]);
            if (v)
            {
                content+='<th>'+v+'</th>';
                c++;
                break;
            }
        }
        /* Header row: ensure that max columns-1 have been created */
        for (i=c;i<hcmax;i++)
        {
            content+='<th></th>';
            c++;
        }            
        /* Header row: Page URL and Time columns */
        content+='<th class="url" style="display:'+(withUrl?gtr.vCell:gtr.vNone)+';">'+(isClick?'':gt.getUrl(rq.tabUrl))+'</th>';
        content+='<th class="time">'+date.toLocaleTimeString().replace(/ /g,'&nbsp;')+'</th>';
        
        /* Header row creation */
        cn=(isClick?gtr.cnClic:(isOther?gtr.cnOther:gtr.cnPage));
        node=document.createElement("tr");
        node.style.display=(visible?gtr.vRow:gtr.vNone);
        node.className = "request "+cn;
        node.title=gtr.sDoubleclic;             
        node.innerHTML = content;
        gtr.dTags.appendChild(node);
        node.addEventListener('dblclick', gt.onDoubleClickTag);        
        
        /* Details row: identified parameters */
        node=document.createElement("tr");
        node.className = cn + " "+gtr.cnInfo+" "+gtr.cnDetail;
        content=detailPrefix+indent1;
        for (gt.translate=true,i=0,c=0,scontent='';i<gtc.rparams.length;i++)
        {
            v=gt.getValue(params, gtc.rparams[i]);
            if (v)
            {
                scontent+=((c>0)?'&ensp;':'')+paramPrefix+gt.getTitle(gtc.rparams[i])+'</b><span class="tooltiptext tooltip-right">'+gtc.rparams[i][0]+'</span></span>:&nbsp;'+v+'</span>';
                c++;
            }
        }       
        /* Details row: site custom variables */
        for (gt.translate=translate,i=0;i<gtc.pcustoms.length;i++)
        {
            v=gt.getValue(params, gtc.pcustoms[i]);
            if (v)
            {
                scontent+=((c>0)?'&ensp;':'')+'<b>'+gt.getTitle(gtc.pcustoms[i])+'</b>:&nbsp;'+v;
                c++;
            }
        }    
        node.style.display=(visible&&infos&&scontent?gtr.vRow:gtr.vNone);    
        content+=scontent+'</td>';   
        node.innerHTML = content;
        gtr.dTags.appendChild(node);         

        /* Advanced row: all parameters still not identified */
        node=document.createElement("tr");
        node.className = cn + " "+gtr.cnInfo+" "+gtr.cnAdvanced;  
        content=(scontent?(detailPrefix+indent2):(detailPrefix+indent1));
        scontent='';
        c=0;
        for (param in params)
        {
            if (params.hasOwnProperty(param))
            {
                v=params[param];
                if (v)
                {           
                    scontent+=((c>0 && !isBr)?'&ensp;':'')+paramPrefix+param+'</b><span class="tooltiptext tooltip-right">'+gt.getParamLabel(param)+'</span></span>:&nbsp;'+decodeURIComponent(v)+'</span>';
                    isBr=false;
                    c++;
                }                    
            }
        }    
        node.style.display=(visible&&advanced&&scontent?gtr.vRow:gtr.vNone);    
        content+=scontent+'</td>';     
        node.innerHTML = content;
        gtr.dTags.appendChild(node);   
          
        /* Scroll to make new tag visible and draw attention */
        gtr.dContent.scrollTop=gtr.dContent.scrollHeight;
        if (visible)
        {
            gt.browser.runtime.sendMessage({type:'newtag'});
        }    
    },
    /**
     * Timer callback
     */
    onTimer : function()
    {
        if (gt.record)
        {
            var sId='',sRq=null, now=new Date(), i=0, ar=[];
            for (sId in gt.rqdone)
            {
                if (gt.rqdone.hasOwnProperty(sId))
                {                    
                    /* Collect all recorded tags still not append when older than 1 second */
                    sRq=gt.rqdone[sId];
					if (sRq.done)
					{
						ar.push(sId);
					}
                    else if ((now-sRq.timeStamp)>1000)
                    {
						gt.addTag(sRq);
                    }
                }
            } 
            /* Add all collected tags */
            for (i=0;i<ar.length;i++)
            {
                delete gt.rqdone[ar[i]];
            } 
        }          
    }, 
    /**
     * Request catching events
     */   
    onSendHeaders : function(rq)
    {        
        if (gt.record)
        {
            /* When still not done, collect the request before any redirection */
            if (!gt.rqdone[rq.requestId] /*&& rq.url.indexOf('/r/')<0*/)
            {                
                gt.browser.tabs.get(rq.tabId,function(Tab){gt.addRequest(rq, Tab.url);});
            }
        }          
    },   
    onHeadersReceived : function(rq)
    {        
        if (gt.record)
        {
            var sId='',sRq=null;
            /* Consume before the recorded SendHeader on the same TabId */
            for (sId in gt.rqdone)
            {
                if (gt.rqdone.hasOwnProperty(sId) && sId!==rq.requestId)
                {                    
                    sRq=gt.rqdone[sId];
                    if (sRq && !sRq.done && sRq.tabId===rq.tabId)
                    {
						gt.addTag(sRq);
                        break;
                    }
                }
            }
            sRq=gt.rqdone[rq.requestId];
            if (sRq && !sRq.done)
            {
                /* Add tag when statusCode is success or redirected */
                if (rq.statusCode===200 || rq.statusCode===302)
                {
					gt.addTag(sRq);
                }
                /* Bad request: log message */
                else
                {
					console.log("G-Tags >> "+rq.url+" has returned status code:"+rq.statusCode.toString());
                }
            }
        }          
    }
};

/******************************************************************************
 * Listeners
 ******************************************************************************/
/**
 * Page load listener
 */
window.addEventListener("load", gt.onLoad);
/**
 * Resize listener
 */
window.addEventListener('resize', gt.onResize, false);
/**
 * Requests listener
 */
gt.browser.webRequest.onSendHeaders.addListener(gt.onSendHeaders, {urls:gt.aufilter});
gt.browser.webRequest.onHeadersReceived.addListener(gt.onHeadersReceived, {urls:gt.aufilter});




