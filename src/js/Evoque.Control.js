//Dependency: Evoque.js
Evoque.control = (function (self)
{
    self.rangeSelect = function ()
    {

    };

    self.button = function ()
    {

    };

    var defaultOption_SliderBar = {
        divId: '',
        // top|bottom|left|right
        dock: 'top'
    };

    self.sliderBar = function (option)
    {
        if (isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        var id = option.getValueOfProperty('divId', defaultOption_SliderBar);
        if (isStringEmpty(id))
        {
            throw 'Parameter is error!';
        }
        var dock = option.getValueOfProperty('dock', defaultOption_SliderBar).toLowerCase();
        var divCollection = $('#' + id);
        if (divCollection.length > 0)
        {
            divCollection[0].style.position = 'fixed';
            divCollection[0].style[dock] = '0';
            switch (dock)
            {
                case 'top':
                case 'bottom':
                    divCollection[0].style.left = '0';
                    divCollection[0].style.width = '100%';
                    break;
                case 'left':
                case 'right':
                    divCollection[0].style.top = '0';
                    divCollection[0].style.height = '100%';
                    break;
            }
        }
    };

    return self;
}(Evoque.control || {}));

