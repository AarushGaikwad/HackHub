package com.hackhub.responsestatus;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ResponseStatus<T> {

    public static enum Status{
        success, error
    }

    private Status status;
    private T data;
    private String message;

    public static <T>ResponseStatus<T> success(T data) {
        return new ResponseStatus<T>(Status.success,data,null);
    }

    public static <T>ResponseStatus<T> error (String message) {
        return new ResponseStatus<T>(Status.error,null,message);
    }

}
