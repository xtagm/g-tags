/**
 * @license @title Chart platform
 * @author DENIS ROUSSEAU
 * @version 2.1
 */
/*jslint nomen: true, plusplus: true, regexp: true, evil: true, continue: true*/
/**
 * Content Platform 
 */
var cp=
{
    /**
     * Event sent to page to get tag details 
     */
    tagQuestion:'xtmTagEventGA',
    tagResponse:'xtmTagResponseGA',
    node:null,
    markat: 'xtm-t',
    selat:'xtm-g',    
    space:{},
    /**
     * Disable platform
     */    
    disable:function()
    {
        
    },        
    /*********************************
     * User management 
     */
    setUser:function(user)
    {
 
    },    
    getUser:function()
    {
        return null ;
    },
    /*********************************
     * Nodes manager 
     */  
    isVideo:function()
    {
        return (cp.space.category==='Video');
    },
    isValid:function()
    {
        return (cp.space.category && cp.space.category.length > 0);
    },
    /*********************************
     * Node description content 
     */
    getNodeText : function(node)
    {
        var nt = '',alt='';
        while (!nt && node && node!==window.document)
        {    
            nt = (node.textContent || ((node.tagName==='INPUT' && (node.type==='text'||node.type==='hidden'))? node.value : '') || ((node.childNodes.length === 1)? node.childNodes[0].nodeValue : ''))  || '' ;
            if (nt)      
            {
                nt = nt.replace(/(^\s*)|(\s*$)|<!--(.*?)-->|(^\s*)|(\s*$)/g, '').replace(/\t|\r\n|\r|\n/g, ' ').replace(/\s{2,}/g,' ') ;
            }
            if (!nt)
            {
                if (node.tagName==='IMG' || node.tagName==='IFRAME')
                {
                    nt=node.getAttribute('src');
                    alt=node.getAttribute('alt');
                    nt=(alt? (alt+(nt?' (':'')):'')+(nt?(nt+(alt?')':'')):'');
                }
                else if (node.title)
                {
                    nt=node.title;
                }
                else if (node.href)
                {
                    break;
                }
            }
            node=node.parentNode;
        }
        return nt ;
    },
    getNodeDescHeader:function()
    {
        return 'HTML type\tText identifier\tTarget\tCategory\tAction\tLabel\tValue\tDuplicate?\r\n';
    },
    getNodeDesc:function(node, map)
    {
        var desc=(node?node.tagName:'')+'\t'+cp.getNodeText(node)+'\t',
        nt=(cp.space.category||'')+'::'+(cp.space.action||'')+'::'+(cp.space.label||'')+'::'+(cp.space.value||'');
        desc+=(node.href?node.getAttribute('href'):'')+'\t';
        desc+=(cp.space.category||'')+'\t';
        desc+=(cp.space.action||'')+'\t';
        desc+=(cp.space.label||'')+'\t';
        desc+=(cp.space.value||'');
        if (map)
        {
            desc+='\t';
            if (map[nt])
            {
                desc+='X';
            }
            else
            {
                map[nt]=true;
            }
        }
        return desc;
    },
    /*********************************
     * Tip content 
     */
    getNodeTip : function(node)
    {
        var tip=cp.space.category?('Category > '+cp.space.category):'';
        tip+=cp.space.action?((tip?cg.sep:'')+'Action > '+cp.space.action):'';
        tip+=cp.space.label?((tip?cg.sep:'')+'Label > '+cp.space.label):'';
        tip+=cp.space.value?((tip?cg.sep:'')+'Value > '+cp.space.value):'';
        return tip;          
    },
    ctaFromTip : function(tip)
    {
        if (tip)
        {
            var at=tip.split(cg.sep), ae=[], i=0, e={c:'',a:'',l:'',v:''}, t='', sep=' &gt; ';
            for (i=0; i<at.length; i++)
            {
                ae=at[i].split(sep);
                if (ae.length>1)
                {
                    t=ae.splice(0,1)[0];
                    switch (t)
                    {
                    case 'Category':
                        e.c=ae.join(sep);
                        break;
                    case 'Action':
                        e.a=ae.join(sep);
                        break;
                    case 'Label':
                        e.l=ae.join(sep);
                        break;
                    case 'Value':
                        e.v=ae.join(sep);
                        break;                        
                    }
                }
            }
            tip=e.c+'\t'+e.a+'\t'+e.l;
            tip+=e.v?('\t'+e.v):'';
        } 
        return tip;
    },
    /*********************************
     * Tag response storage 
     */
    setTagResponse : function(node, response)
    {
        cp.space.node=node;
        cp.space.category=response.category;
        cp.space.action=response.action;
        cp.space.label=response.label;
        cp.space.value=response.value;          
    }
};

var cg=
{
    sep:' || '
};
