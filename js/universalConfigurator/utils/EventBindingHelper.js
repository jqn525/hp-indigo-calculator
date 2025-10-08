export class EventBindingHelper {
  static bindInput(elementId, callback) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('input', callback);
      return true;
    }
    return false;
  }

  static bindChange(elementId, callback) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('change', callback);
      return true;
    }
    return false;
  }

  static bindClick(elementId, callback) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('click', callback);
      return true;
    }
    return false;
  }

  static bindRadioGroup(name, callback) {
    const radios = document.querySelectorAll(`input[name="${name}"]`);
    radios.forEach(radio => {
      radio.addEventListener('change', callback);
    });
    return radios.length > 0;
  }

  static bindOptionCards(callback) {
    document.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        const option = card.dataset.option;
        const value = card.dataset.value;

        if (option === 'turnaround') {
          card.parentNode.querySelectorAll('.option-card').forEach(c =>
            c.classList.remove('selected')
          );
          card.classList.add('selected');

          const radio = card.querySelector('input[type="radio"]');
          if (radio) {
            radio.checked = true;
            callback(value);
          }
        }
      });
    });
  }

  static removeHandler(element, handler) {
    if (element && handler) {
      element.removeEventListener('change', handler);
    }
  }

  static createBoundHandler(instance, handlerName) {
    if (!instance[`_bound_${handlerName}`]) {
      instance[`_bound_${handlerName}`] = instance[handlerName].bind(instance);
    }
    return instance[`_bound_${handlerName}`];
  }

  static bindWithCleanup(elementId, eventType, instance, handlerName) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    const boundKey = `_bound_${handlerName}`;
    if (instance[boundKey]) {
      element.removeEventListener(eventType, instance[boundKey]);
    }

    instance[boundKey] = instance[handlerName].bind(instance);
    element.addEventListener(eventType, instance[boundKey]);
    return true;
  }
}
