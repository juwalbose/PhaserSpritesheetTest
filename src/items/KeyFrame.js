export default class KeyFrame
{
    
    constructor(start,duration,clips)
	{
        this.start=start;
        this.duration=duration;
        this.end=start+duration-1;
        this.clips=clips;
    }
}