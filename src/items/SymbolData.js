export default class SymbolData
{
    
    constructor(name,position,rotation,scale,matrix3d,transformationPoint,color)
	{
        this.name=name;
        this.position=position;
        this.rotation=rotation;
        this.scale=scale;
        this.matrix3d=matrix3d;
        this.color=color;
        this.transformationPoint=transformationPoint;
    }
}