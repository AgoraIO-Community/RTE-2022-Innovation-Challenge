package com.lambo.los.kits;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.annotation.*;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * runnable程序启动器.
 *
 * @author Administrator
 */
public class RunnableMainRunner {
    private final static Logger logger = LoggerFactory.getLogger(RunnableMainRunner.class);

    /**
     * 执行方法 .
     *
     * @param clazz Runnable子类.
     * @param args  参数 -Dkey=value格式的参数..
     */
    public static final void start(Class<? extends Runnable> clazz, String... args) {
        if (null == clazz) {
            throw new BizException("clazz not exist!");
        }
        Properties properties = System.getProperties();
        boolean debug = false;
        if (args.length > 0) {
            for (String arg : args) {
                if (arg.equals("debug")) {
                    debug = true;
                    continue;
                }
                if (arg.startsWith("-D")) {
                    String key = arg.substring(2, arg.indexOf("="));
                    String value = arg.substring(arg.indexOf("=") + 1, arg.length());
                    properties.put(key, value);
                    if (debug) {
                        logger.info("set into config properties key [{}] = value [{}]", key, value);
                    }
                }
            }
        }

        Runnable instance;
        try {
            instance = clazz.newInstance();
        } catch (ReflectiveOperationException e) {
            throw new BizException("newInstance failed," + clazz);
        }
        String fieldName;
        try {
            for (Field field : clazz.getDeclaredFields()) {
                Value valueAnnotation = field.getAnnotation(Value.class);
                if (null == valueAnnotation) {
                    continue;
                }
                field.setAccessible(true);
                Object value = field.get(instance);
                fieldName = field.getName();
                if (field.getType().isArray()) {
                    List<String> values = new ArrayList<>();
                    for (int i = 0; i < 100; i++) {
                        String propertyValue = properties.getProperty(fieldName + i);
                        if (null == propertyValue) {
                            break;
                        }
                        values.add(propertyValue);
                    }
                    if (!values.isEmpty()) {
                        value = values.toArray(new String[values.size()]);
                    }
                } else {
                    value = properties.getProperty(fieldName, null != value ? value.toString() : null);
                }
                if (valueAnnotation.required() && null == value) {
                    throw new BizException(fieldName + " need set value. add -D" + fieldName + "= ??? ");
                }
                field.set(instance, value);
                logger.info("can config field << {}", fieldName);
                if (debug) {
                    logger.info("set config field [{}] = value [{}]", fieldName, value);
                }
            }
        } catch (IllegalAccessException e) {
            throw new BizException("init field failed, on class " + clazz);
        }
        instance.run();
    }

    @Target({ElementType.FIELD, ElementType.METHOD})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @Inherited
    public @interface Value {
        /**
         * 注入的属性名.
         */
        String value() default "";

        /**
         * 是否必须.
         */
        boolean required() default false;
    }
}
