/******************************************************************************
 * @title Tags Controller
 * @author DENIS ROUSSEAU
 * @version 4.5
 ******************************************************************************/
/*jslint nomen: true, plusplus: true, regexp: true*/
/**
 * Tags Controller
 */
var tc=
{
    state : {checks:{}, bar:true},
    rclick: false,
    record : true,
    timeout : 0,
    timer : null,    
    rqdone : {},
    rqurl : [],
    lastParam:{p:'',v:''},
    view:false,
    chart:false,
    user:false,
    settings:{},
    /**
     * Parse URL parameters
     */
    getUrlParser : function(u)
    {
        var params={};
        u.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), function(b, a, d, c)
        {
            a=a.toLowerCase();
            if (!params[a])
            {
                params[a] = c;
            }
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
     * Retrieve parameter title from description array or settings
     */    
    getParamContextLabel : function(ap)
    {
        return ((ap.length>1)?ap[1]:'')||((ap.length>0)?tp.getParamLabel(ap[0]):'');  
    },   
    /**
     * Retrieve parameter label for known space
     */
    getKnownCvarLabel : function(space, param, ap)
    {
        var known=tm.spaces[space],i=0;
        if (!ap && known)
        {
            ap=ts.detail.cvar.val[param];
        }        
        return (((ap && ap.length>0 && known)?ap[0]:'')||param);
    },  
    /**
     * Retrieve parameter label
     */
    getParamTip : function(param)
    {
        var label=tp.getParamLabel(param), ln= param.match(/\d+$/);
        if (label===param && ln)
        {
            label=ts.param[param.replace(ln[0],'_')];
            if (label)
            {
                // Add param index to common label, except for custom variables
                label+=tv.ssep+(tp.isCvar(param)? '':ln[0]);
            }
            else
            {
                label=param;
            }
        }
        return tv.noBreak(label);       
    },  
    /**
     * Built cell title
     */
    getTitle : function(param, action, label)
    {
        return ((label||tp.getParamLabel(param))+' ['+param+'] - '+action) ;
    }, 
    getContextTitle : function(ap, action)
    {
        return tc.getTitle(ap[0],action,tc.getParamContextLabel(ap)) ;
    },     
    /**
     * Retrieve space value
     */
    getSpaceValue : function(params, ap)
    {
        var v=params[ap[0]], cbs='';
        if (v)
        {
            params[ap[0]]=null;
            tm.setCurSpace(v);            
        }
        return ((v==='undefined')?'':v);      
    }, 
    /**
     * Retrieve Sub Space value
     */
    getSubValue : function(params, ap)
    {
        var v=params[ap[0]];
        if (v)
        {
            v=decodeURIComponent(v);
            params[ap[0]]=null;                              
        }
        return ((v==='undefined')?'':v);      
    },  
    /**
     * Retrieve parameter's translation
     */    
    getValueTrans: function(value, ap, space)
    {
        var i=0, av=[], v=value;
        if (value && ap && (!space || tm.spaces[space]))
        {
            for (i=0;i<ap.length;i++)
            {
                av=ap[i].split(':');
                if (av.length===2 && (av[0]==='*'||av[0]===value.toLowerCase()))
                {
                    v=((av[1].charAt(0)==='-')?(value+' - '+av[1].substr(1)):av[1]);
                    break;
                }
            }
        }
        return v;        
    },     
    /**
     * Retrieve parameter value and possibly its translation
     */
    getParamValue : function(params, ap, translate)
    {
        var v='',i=0,n=0,av=[],an=ap.length?ap[0].split('|'):[];
        tc.lastParam={'p':'','v':''};
        for (n=0; n<an.length;n++)
        {
            v=params[an[n]];
            if (v)
            {
                params[an[n]]=null;                
                try
                {
                    v=decodeURIComponent(v);                    
                }
                catch (err) {console.log('tc.getParamValue(..) '+v+' '+err.message);} 
                tc.lastParam={'p':an[n],'v':v};               
                if (translate || tm.spaces[tm.last])
                {
                    v=tc.getValueTrans(v,ap.slice(2));
                }
                break;  
            }
        }
        return ((v==='undefined')?'':v);      
    },
    
    /**
     * Retrieve checkbox stored value
     */
    getCheckSetting : function(k, defval)
    {
        var v=tc.state.checks[k];
        return (v?((v==='1')?true:false):defval);
    },
    recordChanged : function()
    {
        if (tc.record && !tc.timer)
        {
            tc.timer=window.setInterval(tc.onTimer, 1000);
        }
        else if (tc.timer)
        {
            window.clearInterval(tc.timer);
            tc.timer=null;
        }
    },
    /**
     * Clic on record light
     */
    onClickRecord : function(e)
    {
        this.classList.toggle(tr.cnActive);
        tc.record=(this.className.indexOf(tr.cnActive)>=0);
        this.title=(tc.record? trs.stop:trs.resume); 
        tc.recordChanged();       
    },
    /**
     * Checkbox actions
     */
    allCheckChanged : function(cbx,selector,visibleStyle,emptyVisible)
    {
        var an=document.querySelectorAll(selector), i=0, v=(cbx.checked?'1':'0');
        for (i=0;i<an.length;i++)
        {
            an[i].style.display=(cbx.checked&&(emptyVisible||an[i].textContent.replace(/(^\s*)/g, "")))?(visibleStyle||"block"):tv.vNone;
            if (visibleStyle===tv.vRow && an[i].className.indexOf(tr.cnInfo)<0)
            {
                tc.toggleRow(an[i],cbx.checked);
            }
        }
        tc.state.checks[cbx.id]=v;
        tm.persist.set({'statechecks':tc.state.checks});
    },    
    typeCheckChanged : function(cbx, type)
    {
        tc.allCheckChanged(cbx, '.'+tr.cnTag+'.'+type, tv.vRow);
    },
    infosCheckChanged: function(cbx, root)
    {
        if (tr.cPage.checked)
        {
            tc.allCheckChanged(cbx, '.'+tr.cnPage+root, tv.vRow);        
        }
        if (tr.cCTA.checked)
        {
            tc.allCheckChanged(cbx, '.'+tr.cnCTA+root, tv.vRow);        
        }
        if (tr.cOther.checked)
        {
            tc.allCheckChanged(cbx, '.'+tr.cnOther+root, tv.vRow);        
        }           
    },  
    detailsCheckChanged : function(checked)
    {
        var cbx=tr.cAdvanced;
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
        tc.typeCheckChanged(this, tr.cnPage);
    },
    onCheckCTA: function(e)
    {
        tc.typeCheckChanged(this, tr.cnCTA);
    },    
    onCheckOther: function(e)
    {
        tc.typeCheckChanged(this, tr.cnOther);
    },     
    onCheckUrl: function(e)
    {
        tc.allCheckChanged(this, '.'+tr.cnUrl, tv.vCell, true);
    },   
    onCheckDetails: function(e)
    {
        tc.infosCheckChanged(this,(this.checked?('.'+tr.cnInfo+'.'+tr.cnDetail):('.'+tr.cnInfo)));
        tc.detailsCheckChanged(this.checked);          
    }, 
    onCheckAdvanced: function(e)
    {
        tc.infosCheckChanged(this,'.'+tr.cnInfo+'.'+tr.cnAdvanced);
    },      
    /**
     * Clipoard copy event
     */
    onClickCopy : function(e)
    {
        var an=document.querySelectorAll('.'+tr.cnTag), i=0, s='', att='', index=0, c=0;
        for (i=0;i<an.length;i++)
        {
            if (an[i].style.display===tv.vRow)
            {
                c++;
                s+=tv.getTableRowHeads(an[i], '\t');
                att=an[i].getAttribute('index');
                index=att?parseInt(att,10):-1;
                s+=((index>=0 && index<tc.rqurl.length)?('\t'+decodeURIComponent(tc.rqurl[index])):'')+'\r\n';
            }
        }
        if (s)
        {
            tm.wx.runtime.sendMessage({type: 'bm_copy', text: s});
            tc.showMsgBar(trs.copyDone.replace('#',c.toString()));
        }        
    },
    /**
     * Clear content event
     */
    onClickClear : function(e)
    {
        tr.dTags.innerHTML= "";
        tc.rqurl.length=0;
    },
    /**
     * Click on chevron event
     */
    onClickChevron : function(e)
    {
        tc.toggleBar(false);
        e.stopPropagation();
        return false;        
    },
    /**
     * Click on reduced bar header
     */
    onClickBar: function()
    {
        tc.toggleBar(true);
    },
    onDoubleClickBar: function()
    {
        tc.toggleBar(false);       
    },
    /**
     * Click on tag viewer
     */
    onClickView:function()
    {
        tc.toggleView();
    },
    /**
     * Click on tag+chart viewer
     */
    onClickChart:function()
    {
        if (!tc.chart && !tc.settings.email)
        {
            tc.showMsgBar(trs.credentials, tc.user?null:tc.toggleUser);
        }
        else
        {
            tc.toggleChart();
        }
    },  
    /**
     * Click on User
     */
    onClickUser:function()
    {
        tc.toggleUser(); 
        if (tc.user)
        {
            tm.persist.get('user', function(item)
            { 
                var user=item.user||{};
                tr.tEmail.value=user.email||'';
                tr.tPwd.value=user.pwd||''; 
                tr.sPeriod.value=user.period||tr.sPeriod.options[tr.sPeriod.selectedIndex].value;              
            });             
        }       
    },  
    /**
     * Submit User changes
     */
    onClickApply:function(evt)
    {         
        var user={email:tr.tEmail.value,pwd:tr.tPwd.value,period:tr.sPeriod.options[tr.sPeriod.selectedIndex].value};
        tc.settings=user; 
        tp.checkCredentials(tc.onCredentials, tc.onCredentialsFailure, {email:user.email, pwd:user.pwd}); 
        return false;
    },   
    /**
     * Credentials validation
     */
    onCredentials:function(data)
    {
        if (data && data.UserID)
        {
            tm.persist.set({user:tc.settings});
            tm.wx.runtime.sendMessage({type:'cc_userSettings','user':tc.settings});   
            tp.setUser(tc.settings);
            tc.showMsgBar('User settings validated');            
            tc.toggleUser();            
        }
    }, 
    onCredentialsFailure:function(status)
    {
        if (status===401)
        {
            tc.showMsgBar('These are not valid credentials');
            tm.persist.get('user', function(item)
            {
                tc.settings=(typeof item.user==='object')?item.user:{};                  
            });            
        }
    },     
   /**
     * Page load event
     */
    onLoad : function()
    {
        /*
         * Initialisation from storage
         */
        tm.persist.get('statechecks', function(item)
        {
            tc.state.checks=item.statechecks||{};   
            tm.persist.get('statebar', function(item)
            {
                if (typeof item.statebar==='boolean')
                {
                    tc.state.bar=item.statebar;
                }
                tm.persist.get('user', function(item)
                {
                    if (typeof item.user==='object')
                    {
                        tc.settings=item.user;
                        tp.setUser(tc.settings);
                    }                    
                    tc.onLoadState();
                });
            });                      
        });
        /*
         * Right Double-click handler
         */
        document.body.oncontextmenu=function(event) 
        {
            if (tc.rclick)    
            {
                tc.rclick=false;
                tc.onClickClear();
            }
            else
            {
               tc.rclick=true;
               setTimeout(function(){tc.rclick=false;},500);
            }
            return false;
        };        
    },
    /**
     * Page load event
     */
    onLoadState : function()
    {
        var i=0, cev="click";
        tp.init();
        tr.init();
        document.title=tps.name+' | '+tps.desc;
        for (i=0;i<tr.acbx.length;i++)
        {
            tr.acbx[i].checked=tc.getCheckSetting(tr.acbx[i].id,tr.acbx[i].checked);
        }
        tc.detailsCheckChanged(tr.cDetails.checked);
        /*
         * Record led click 
         */
        tr.dRecord.addEventListener(cev, tc.onClickRecord);
        /*
         * Filters clicks
         */
        tr.cPage.onchange = tc.onCheckPage;
        tr.cCTA.onchange = tc.onCheckCTA;
        tr.cOther.onchange = tc.onCheckOther;
        /*
         * Enhanced information clicks
         */
        tr.cUrl.onchange = tc.onCheckUrl;
        tr.cDetails.onchange = tc.onCheckDetails;
        tr.cAdvanced.onchange = tc.onCheckAdvanced;   
        /*
         * General commands
         */     
        tr.bChevron.addEventListener(cev, tc.onClickChevron);  
        if (tr.bBook)
        {
            tr.bBook.addEventListener(cev, tc.onClickBook);
        }
        tr.bCopy.addEventListener(cev, tc.onClickCopy);       
        tr.bClear.addEventListener(cev, tc.onClickClear); 
        /*
         * Viewers and user settings
         */
        if (tr.bView)
        {
            tr.bView.addEventListener(cev, tc.onClickView);
        }
        if (tr.bChart)
        {
            tr.bChart.addEventListener(cev, tc.onClickChart);
        }
        if (tr.bUser)
        {
            tr.bUser.addEventListener(cev, tc.onClickUser);
        }
        /*
         * User settings form
         */
        if (tr.fUserForm && tr.bApply)
        {                       
            tr.fUserForm.addEventListener(cev, function(e){e.preventDefault();});
            tr.bApply.addEventListener(cev, tc.onClickApply);
        }       
        tr.dBar.addEventListener(cev, tc.onClickBar);  
        tr.dBar.addEventListener('dblclick', tc.onDoubleClickBar); 

        if (!tc.state.bar)
        {
            setTimeout(function(){tc.toggleBar(false);}, 1000);
        }        
        tc.recordChanged(); 
    },
    /**
     * Resize event
     */
    onResize : function()
    {
        if (tc.timeout) 
        {
            clearTimeout(tc.timeout);
        }
        tc.timeout = setTimeout(function() 
        {
            tm.wx.runtime.sendMessage({type:'bm_resize'});
            tc.timeout = 0;
        }, 100);        
    },
    /**
     * Toggle control bar
     */
    toggleBar : function(isVisible)
    {
        var cVisible=(tr.dBar.className.indexOf(tr.cnReduced)<0);
        if (isVisible!==cVisible)
        {
            if (isVisible)
            {
                tc.rheight=tr.dBar.clientHeight;
                tr.dBar.classList.remove(tr.cnReduced);
                setTimeout(function()
                {
                    tr.dContent.scrollTop+=tr.dBar.clientHeight-tc.rheight+1;
                },300);
            }
            else
            {
                tr.dBar.classList.add(tr.cnReduced);
            }
            tr.dBar.title=(isVisible? '':trs.expand);
            tm.persist.set({'statebar':isVisible});
        }
    },
    /**
     * Expand/Collapse row details
     */
    toggleRow : function(row, forced)
    {
        var node=row.nextSibling, vis=true, f=(typeof forced==='boolean'), 
        toggle=function(n,vis,checked,forced)
        {
            vis=vis&&((n.style.display===tv.vNone)||checked)&&forced;
            n.style.display=(vis&&n.textContent.replace(/(^\s*)/g, ""))?tv.vRow:tv.vNone;
            return vis;
        };            
        if (node)
        {
            vis=toggle(node,vis,tr.cDetails.checked,(!f||(forced&&tr.cDetails.checked)));
            node=node.nextSibling;
            if (node)
            {
                vis=toggle(node,vis,false,(!f||(forced&&tr.cAdvanced.checked)));
            }            
        }
    },    
    /**
     * Enable/Disable tags viewer
     */
    toggleView : function(view)
    {
        if (tr.bView)
        {
            var state=(view===undefined)?!tc.view:view;        
            tr.bView.title=state?trs.title.viewon:trs.title.view;              
            if (state)
            {
                tr.bView.classList.add('cenable');            
                if (tc.chart)
                {
                    tc.toggleChart();
                }
                setTimeout(function()
                {
                    tc.view=true;                  
                    tm.wx.runtime.sendMessage({type:'bm_enableView'});                
                },100);
            }
            else
            {
                tr.bView.classList.remove('cenable');
                tc.view=false;              
                if (view===undefined)
                {
                    tm.wx.runtime.sendMessage({type:'bm_disableView'});
                }            
            }
        }
    },
   
    /**
     * Enable/Disable tags+chart viewer
     */
    toggleChart : function(chart, fn)
    {
        if (tr.bChart)
        {
            var state=(chart===undefined)?!tc.chart:chart;        
            tr.bChart.title=state?trs.title.charton:trs.title.chart;              
            if (state)
            {
                tr.bChart.classList.add('cenable');            
                if (tc.view)
                {
                    tc.toggleView();
                }
                setTimeout(function()
                {
                    tc.chart=true;
                    tm.wx.runtime.sendMessage({type:'bm_enableViewChart'});               
                },100);        
            }
            else
            {
                tr.bChart.classList.remove('cenable'); 
                tc.chart=false;  
                if (chart===undefined)
                {                
                    tm.wx.runtime.sendMessage({type:'bm_disableView'});                
                }             
            }
        }
    },  
    /**
     * Enable/Disable tags viewer
     */
    toggleUser : function(user)
    {
        if (tr.bUser)
        {
            if (tc.user || (user!==undefined && !user))
            {
                tr.bUser.classList.remove('cenable');
            }
            else
            {
                if (tc.chart){tc.toggleChart();}
                if (tc.view){tc.toggleView();}
                tr.bUser.classList.add('cenable');
            }
            if (user===undefined)
            {
                tr.dUserContent.style.display=tc.user?tv.vNone:tv.vBlock;
            }
            tc.user=(user===undefined)?!tc.user:user;
            tr.bUser.title=tc.user?trs.title.useron:trs.title.user;          
        }
    }, 
    /**
     * Copy current cell in clipboard
     */    
    copyCell : function(node)
    {
        var s=node.textContent;
        if (s)
        {
            tm.wx.runtime.sendMessage({type: 'bm_copy', text: s});
        }           
    },
    /**
     * Transient messages
     */      
    showMsgTag : function(node, msg, rnode, fnEnd)
    {
        tr.dMsg.innerHTML=msg;
        var rc = node.getBoundingClientRect(), rcm=tr.dMsg.getBoundingClientRect(), delay=1500, 
        x1=rc.right - rcm.right + rcm.left -1, x2=rnode?rnode.getBoundingClientRect().right+4:x1;
        tr.dMsg.style.top = rc.top.toString() + "px";
        tr.dMsg.style.left = (Math.min(x1,x2)).toString() + "px";              
        tr.dMsg.style.visibility="visible";
        tr.dMsg.style.opacity="1";
        setTimeout(tc.hideMsgTag, delay);
        if (fnEnd)
        {
            setTimeout(fnEnd, delay);
        }
    },      
    hideMsgTag : function()
    {
        tr.dMsg.style.opacity="0";
        tr.dMsg.style.visibility="hidden";
        tr.dMsg.innerHTML='';
    }, 
    showMsgBar : function(msg, fnEnd)
    {
        tr.dHelp.innerHTML=msg;
        var rc = tr.bUser?tr.bUser.getBoundingClientRect():tr.cAdvanced.parentNode.getBoundingClientRect(), delay=2500; 
        tr.dHelp.style.top = "0px";
        tr.dHelp.style.left = (rc.right+8).toString() + "px";              
        tr.dHelp.style.visibility="visible";
        tr.dHelp.style.opacity="1";
        setTimeout(tc.hideMsgBar, delay);
        if (fnEnd)
        {
            setTimeout(fnEnd, delay);
        }
    }, 
    hideMsgBar : function()
    {
        tr.dHelp.style.opacity="0";
        tr.dHelp.style.visibility="hidden";
        tr.dHelp.innerHTML='';
    },         
    /**
     * Double-click on tag event
     */
    onDoubleClickTag : function(e)
    {        
        if (!event.target.previousSibling)
        {            
            if (window.getSelection)
            {
                window.getSelection().removeAllRanges();
            }
            tc.toggleRow(this);           
        }   
        else
        {       
            var s, r=null;
            if (window.getSelection)
            {
                s=window.getSelection();
                r=document.createRange();
                r.selectNodeContents(event.target);
                s.removeAllRanges();
                s.addRange(r);
            }
            if (r && r.toString().length>0)
            {
                tc.copyCell(event.target);
                tc.showMsgTag(event.target, trs.copied, r, function(){window.getSelection().removeAllRanges();});
            }
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    },
    /**
     * Click on Online guide book
     */
    onClickBook:function(e)
    {
        var b=tp.getBook();
        if (b)
        {
            window.open(b);
        }
    },    
    /**
     * Click on row chart
     */
    onClickRowChart:function(e)
    {
        if (!tc.settings.email)
        {
            tc.showMsgBar(trs.credentials, tc.user?null:tc.toggleUser);
        }
        else
        {        
            var rc=e.target.getBoundingClientRect(), p=tv.getTableRowHeads(tv.getNodeTableRow(e.target), ';');
            p=tc.settings.period+';'+p;
            window.open("rchart.html?p="+encodeURIComponent(p)+'#'+tp.getUser(),"X-Tags Chart","width=350,height=200,titlebar=0,status=0,menubar=0,top="+window.screenY.toString()
                         +",left="+(window.screenX+rc.left+rc.width+4).toString());
        }
    },
    /**
     * Request recording
     */
    addRequest : function(rq, tu)
    {
        tc.rqdone[rq.requestId]={requestId:rq.requestId,tabId:rq.tabId,url:rq.url,timeStamp:rq.timeStamp,tabUrl:tu,done:false};
    },
    isFiltered : function(v)
    {
        var i=0;
        for (i=0;i<ts.space.filtered.length;i++)
        {
            if (v===ts.space.filtered[i])
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
        tc.rqdone[rq.requestId].done=true;  
        
        var node=null, content='', i=0, c=0, cs=1, v='',param=null, params=tc.getUrlParser(rq.url),isBr=true, ah=[], ap=[], scontent='',cn='',
        date=new Date(rq.timeStamp), index = tc.rqurl.push(rq.url)-1, cmin=1,
        hdr=ts.header, tmt=tm.type,
        visible=true, translate=false, ptrans=false,
        withUrl= tr.cUrl.checked, infos= tr.cDetails.checked, advanced=false, label='', tip='', val='';
        
        /* Compute type and visibility */
        tp.setParams(rq, params);
        visible=((tmt.cta && tr.cCTA.checked) || (tmt.other && tr.cOther.checked) || (!tmt.cta && !tmt.other && tr.cPage.checked));
        
        tc.detailsCheckChanged(infos);
        advanced= tr.cAdvanced.checked;    
        
        /* Header row: Tag type column */   
        val=tc.getParamValue(params, (tmt.cta?hdr.type.cta:(tmt.other?hdr.type.other:hdr.type.page)), true)||(tmt.cta?trs.cta:(tmt.other?trs.other:trs.page));
        content+=tv.nodeHeaderCellType(tp.getTypeLabel(val), tr.cnType, (tc.lastParam.v?('['+tc.lastParam.p+'='+tc.lastParam.v+'] '):'')+trs.rowDoubleClic, null, tp.isTypeChart(val));
                
        /* Header row: space column (mandatory) */
        for (i=0,c=0;i<hdr.space.length;i++)
        {
            v=tc.getSpaceValue(params, hdr.space[i]);
            if (v)
            {
                /* Check filtered space */
                if (tc.isFiltered(v))
                {
                    return;
                }
                v=tp.getSpaceLabel(v);
                content+=tv.nodeHeaderCell(v, tr.cnSpace, tc.getTitle(hdr.space[i][0], trs.doubleclic));
                c++;    
                break;            
            }
        } 
        if (c===0 && tmt.other)
        {
            return;
        }
        /* Header row: Ensure that space column has been created */
        if (c<1)
        {
            content+=tv.header;
            c++;
        }          
        /* Header row: Sub Space column */
        for (i=0;i<hdr.spsub.length;i++)
        {        
            v=tc.getSubValue(params, hdr.spsub[i]);
            if (v)
            {
                v=tp.getSubLabel(tm.last, v); 
                content+=tv.nodeHeaderCell(v, tr.cnSub, tc.getTitle(hdr.spsub[i][0], trs.doubleclic));
                c++;
                break;
            }
        }       
        cmin+=(hdr.spsub.length?1:0);  
        /* Header row: Ensure that column has been created */
        if (c<cmin)
        {
            cs++;
            c++;
        }        
        /* Header row: Complement column, depending on tag type */
        ah = hdr.compl||[];
        for (i=0;i<ah.length;i++)
        {
            v=tc.getParamValue(params, ah[i], true);
            if (v)
            {
                content+=tv.nodeHeaderCell(v, tr.cnSub, tc.getContextTitle(ah[i],trs.doubleclic));
                c++;
                break;
            }
        }     
        cmin+=(ah.length?1:0);  
        if (c<cmin)
        {
            cs++;
            c++;
        }                      
        /* Header row: Name column, depending on tag type */
        ah = ((tmt.cta)? hdr.name.cta:(tmt.other? hdr.name.other:hdr.name.page));
        for (i=0;i<ah.length;i++)
        {
            v=tc.getParamValue(params, ah[i], true);
            if (v)
            {
                // In case of & in name, only the part before will be taken into account
                v=v.split('&')[0];
                if (v)
                {
                    content+=tv.nodeHeaderCell(v, tr.cnName, tc.getContextTitle(ah[i],trs.doubleclic), '', cs);
                    cs=1;
                    c++;
                    break;
                }
            }
        }
        /* Header row: ensure that all columns have been created */
        if (c<(cmin+1))
        {
            content+=tv.nodeHeaderCellEmpty(cs);
        }            
        /* Header row: Page URL and Time columns */
        content+=tv.nodeHeaderCellUrl((tp.isURL()?tc.getUrl(rq.tabUrl):''), tr.cnUrl, trs.tagurl,(withUrl?tv.vCell:tv.vNone),rq.tabUrl);
        content+=tv.nodeHeaderCell(tv.noBreak(date.toLocaleTimeString()), tr.cnTime);
        
        /* Node creation */
        cn=(tmt.cta?tr.cnCTA:(tmt.other?tr.cnOther:tr.cnPage));
        node=tv.nodeRow(content, tr.cnTag+' '+cn, visible, index);
        tr.dTags.appendChild(node);
        node.addEventListener('dblclick', tc.onDoubleClickTag);
        node=node.querySelector('.cchart');
        if (node)
        {
            node.title=trs.title.rowchart;
            node.addEventListener('click', tc.onClickRowChart);
        }
        
        /* Details row: identified parameters */
        content=tv.detail+tv.tree1;
        for (i=0,c=0,scontent='';i<ts.detail.other.length;i++)
        {
            val=decodeURIComponent(params[ts.detail.other[i][0]]);
            v=tc.getParamValue(params, ts.detail.other[i], true);
            if (v)
            {
                label=tp.getParamLabel(ts.detail.other[i][0]);
                tip=((label===ts.detail.other[i][0])? tc.getParamTip(ts.detail.other[i][0]) : (ts.detail.other[i][0]+((v===val)?'':('='+val))));
                scontent+=((c>0)?'&ensp;':'')+tv.param+tv.tip+'<b>'+label+'</b>'+tv.tipText+tip+'</span></span>:&nbsp;'+v+'</span>';
                c++;
            }
        }       
        /* Details row: custom variables */
        for (i=0;i<ts.detail.cvar.max;i++)
        {            
            param=ts.detail.cvar.prefix+(i+1).toString();
            val=v=params[param];
            if (v)
            {
                params[param]=null;
                try
                {
                    val=v=decodeURIComponent(v);
                }
                catch (err1) 
                {
                    console.log('tc.addTag(..) custom variables:'+v+' '+err1.message);
                }   
            }     
            ap=ts.detail.cvar.val[param];    
            v=tc.getValueTrans(v, (ap?ap.slice(1):[]), tm.last);
            if (v)
            {
                label=tp.getCvarLabel(tm.last, param, ap);
                tip=tc.getParamTip(param) + (param+((v===val)?'':('='+val)));
                scontent+=((c>0)?'&ensp;':'')+tv.param+tv.tipVar+'<b>'+label+'</b>'+tv.tipText+tip+'</span></span>:&nbsp;'+v+'</span>';
                c++;
            }
        } 
        node=tv.nodeRow(content+scontent+'</td>', cn+" "+tr.cnInfo+" "+tr.cnDetail, (visible&&infos&&scontent));
        tr.dTags.appendChild(node);         

        /* Advanced row: all parameters still not identified */
        content=(scontent?(tv.detail+tv.tree2):(tv.detail+tv.tree1));
        scontent='';
        for (param in params)
        {
            if (params.hasOwnProperty(param))
            {
                v=params[param];
                if (v)
                {
                    try
                    {
                        v=decodeURIComponent(v);
                    }
                    catch (err2) {console.log('tc.addTag(..) Advanced:'+v+' '+err2.message);}                                                          
                    scontent+=((c>0 && !isBr)?'&ensp;':'')+tv.param+tv.tip+'<b>'+param+'</b>'+tv.tipText+tc.getParamTip(param)+'</span></span>:&nbsp;'+v+'</span>';
                    isBr=false;
                    c++;
                }                    
            }
        }    
        node=tv.nodeRow(content+scontent+'</td>', cn + " "+tr.cnInfo+" "+tr.cnAdvanced, (visible&&advanced&&scontent));
        tr.dTags.appendChild(node);   
          
        /* Scroll to make new tag visible and draw attention */
        tr.dContent.scrollTop=tr.dContent.scrollHeight;
        if (visible)
        {
            tm.wx.runtime.sendMessage({type:'bm_newtag'});
        }    
    },
    /**
     * Timer callback
     */
    onTimer : function()
    {
        if (tc.record)
        {
            var sId='',sRq=null, now=new Date(), i=0, ar=[];
            for (sId in tc.rqdone)
            {
                if (tc.rqdone.hasOwnProperty(sId))
                {                    
                    /* Collect all recorded tags still not append when older than 1 second */
                    sRq=tc.rqdone[sId];
					if (sRq.done)
					{
						ar.push(sId);
					}
                    else if ((now-sRq.timeStamp)>1000)
                    {
						tc.addTag(sRq);
                    }
                }
            } 
            /* Add all collected tags */
            for (i=0;i<ar.length;i++)
            {
                delete tc.rqdone[ar[i]];
            } 
        }          
    }, 
    /**
     * Request catching events
     */   
    onSendHeaders : function(rq)
    {        
        if (tc.record)
        {
            /* When still not done, collect the request before any redirection */
            if (!tc.rqdone[rq.requestId] && tp.isRequest(rq))
            {                
                tm.wx.tabs.get(rq.tabId,function(Tab){tc.addRequest(rq, Tab.url);});
            }
        }          
    },   
    onHeadersReceived : function(rq)
    {        
        if (tc.record)
        {
            var sId='',sRq=null;
            /* Consume before the recorded SendHeader on the same TabId */
            for (sId in tc.rqdone)
            {
                if (tc.rqdone.hasOwnProperty(sId) && sId!==rq.requestId)
                {                    
                    sRq=tc.rqdone[sId];
                    if (sRq && !sRq.done && sRq.tabId===rq.tabId)
                    {
						tc.addTag(sRq);
                        break;
                    }
                }
            }
            sRq=tc.rqdone[rq.requestId];
            if (sRq && !sRq.done)
            {
                /* Add tag when statusCode is success or redirected */
                if (rq.statusCode===200 || rq.statusCode===302)
                {
					tc.addTag(sRq);
                }
                /* Bad request: log message */
                else
                {
					console.log(tps.name+" >> "+rq.url+" has returned status code:"+rq.statusCode.toString());
                }
            }
        }          
    },
    onKeyDown : function(e)
    {
        if (tc.view || tc.chart)
        {
            if (e.keyCode === 27) 
            {
                if (tc.view){tc.toggleView();}
                if (tc.chart){tc.toggleChart();}
            } 
            else if (e.keyCode === 107)
            {
                tm.wx.runtime.sendMessage({type: 'tb.persist'});            
            }
        }
        return false;
    }    
};
/******************************************************************************
 * Listeners
 ******************************************************************************/
/**
 * Page load listener
 */
window.addEventListener("load", tc.onLoad);
/**
 * Resize listener
 */
window.addEventListener('resize', tc.onResize, false);
/**
 * Escape listener
 */
window.document.addEventListener("keydown", tc.onKeyDown);
/**
 * URL requests listener
 */
tm.wx.webRequest.onSendHeaders.addListener(tc.onSendHeaders, {urls:tp.urls});
tm.wx.webRequest.onHeadersReceived.addListener(tc.onHeadersReceived, {urls:tp.urls});
/**
 * Custom events listener
 */
tm.wx.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
    switch (request.type)
    {
    /* 
     * Request to disable view mode
     */
    case 'tc_disableView':
        tc.toggleView(false);
        tc.toggleChart(false);
        sendResponse({status:true});
        break;
    /*
     * Request for current user settings
     */
    case 'tc_userSettings':
        if (tc.settings.email)
        {
            sendResponse({user:tc.settings, activate:request.activate});
        }
        else
        {
            if (!tc.user)
            {
                toggleUser();
            }
        } 
        break;        
    }
});



